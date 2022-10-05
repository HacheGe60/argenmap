class IElevationProfile {
    constructor() {
        this.serviceURL = "https://imagenes.ign.gob.ar/geoserver/ows?service=WMS&version=1.1.1";
        this.serviceLayer = "geoprocesos:alos_unificado";
        this.values = "";
        this.data = [];
        this.namePrefix = "elevation_profile_";
    }

    drawPolyline() {
        const drawPolyline = new L.Draw.Polyline(mapa);
        $("#drawBtn").addClass("disabledbutton");
        $("#msgRectangle").addClass("hidden");
        drawPolyline.enable();
    }

    getFields() {
        
        const inputs = [
          {
            name: "Capa",
            element: "select",
            references: "drawedLayers",
            allowedTypes: ["polyline"],
            points: ["ne", "sw"],
          },
          {
            name: "Dibujar línea",
            element: "button",
            id: "drawBtn",
            onclick: this.drawPolyline
        }
        ];
        this.addWrapper();
        return inputs;
    }

    executeElevationProfile() {
        let layerSelected;
        mapa.editableLayers.polyline.forEach((polyline) => {
            let selctedLayerName = document.getElementById("select-capa").value;
            if (polyline.name === selctedLayerName) {
                layerSelected = polyline;
            }
        });

        geoProcessingManager.loadingBtn("on")
        //let lastPolyline = mapa.editableLayers.polyline.at(-1);
        this._processLayer(layerSelected.getGeoJSON());
        this._executeProcess();
        
    }
        
    _processLayer(geoJSON) {
        this.values = [];
        let c = geoJSON.geometry.coordinates;
        let comma = "";

        for (let i = 0; i < c.length; i++) {
            this.values += `${comma}${c[i][0]} ${c[i][1]}`;
            comma = ",";
        }
        return this.values;
    }

    _executeProcess() {
        this.data = [];
        let elevationProfile = new GeoserviceFactory.ElevationProfileGetFeatureInfo(
            this.serviceURL, this.serviceLayer);

        elevationProfile
        .execute(this.values)
        .then((result) => {
            let altura;
            let distancia = 0.0;
            let desde = null;
            let hasta = null;
    
            for (let i = 0; i < result.coordinates.length; i++) {
    
                altura = result.coordinates[i][2].toFixed(2).toString();
    
                this.data.push({
                    x: Math.floor(distancia * 100) / 100,
                    lat: result.coordinates[i][0],
                    lng: result.coordinates[i][1],
                    y: parseFloat(altura),
                    dist: 'Distancia: ' + (distancia) + ' (km)'
                });
    
                if ((i + 1) < result.coordinates.length) {
                    desde = turf.point([result.coordinates[i][0], result.coordinates[i][1]]);
                    hasta = turf.point([result.coordinates[i + 1][0], result.coordinates[i + 1][1]]);
    
                    distancia = distancia + turf.distance(desde, hasta, { units: 'kilometers' });
                };
            }
            let layername = this.namePrefix + results_counter;
            results_counter++;
            let dataForDisplay = this.data;
            let selectedPolyline = mapa.editableLayers.polyline.at(-1).name;

            //menu_ui.addFileLayer("Geoprocesos", layername, layername, layername);
            this.addGeoprocessLayer("Geoprocesos", layername, selectedPolyline, layername);
            addedLayers.push({
                id: layername,
                name: layername,
                file_name: layername,
                layer: result,
                data: dataForDisplay,
                polyline: selectedPolyline,
              });

            this._displayResult(dataForDisplay, selectedPolyline);
            geoProcessingManager.loadingBtn("off")

            document.getElementById("select-process").selectedIndex = 0;
            document.getElementsByClassName("form")[1].innerHTML = "";
            new UserMessage(`Geoproceso ejecutado exitosamente.`, true, "information");
        })
        .catch((error) => {
            console.log('Hay error: ', error);
            new UserMessage(error, true, 'error');
            geoProcessingManager.loadingBtn("off")
        });
    }

    clickDisplayResult(id) {
        let aux = document.getElementById("flc-" + id),
        selectedLayer,
        wrapper =  document.getElementById("pt-wrapper"),
        ptInner =  document.getElementById(id);

        mapa.editableLayers.polyline.forEach(polyline => {
            if (polyline.name === id) {
                selectedLayer = polyline;
            }
        });

        if (aux.classList.contains("active")) {
            if (wrapper.classList.contains("hidden")) {//if wrapper window is closed while btn is active
                wrapper.classList.toggle("hidden");
            }
            else {
                aux.classList.remove("active")
                selectedLayer.remove();
                ptInner.classList.toggle("hidden");
            }
       
        }
        else if (!aux.classList.contains("active")) {
            if (wrapper.classList.contains("hidden")) { //if wrapper is  hidden & all layers are deactivated
                wrapper.classList.toggle("hidden");
            }
            aux.classList.add("active");
            selectedLayer.addTo(mapa);
            ptInner.classList.toggle("hidden");
        }
        
        //Is wrapper empty?
        let count = 0; 
        addedLayers.forEach(layer => {
            if (layer.id.includes("elevation_profile")) {
                count++;
            }
        });
        if (document.getElementById("elevationProfile").querySelectorAll('.hidden').length == count) {
            wrapper.classList.toggle("hidden");
        }
    }


    addWrapper() {
        if (document.getElementById("pt-wrapper")) {
            return 0
        }
        else {
            const wrapper = document.createElement("div");
            wrapper.id="pt-wrapper";
            wrapper.classList = "justify-content-center col-12 col-xs-12 col-sm-6 col-md-6 hidden"
            
            document.body.appendChild(wrapper);
    
            $("#pt-wrapper").append(`
                <div class="pt" id="elevationProfile">
                    <a href="javascript:void(0)" style="float:right; color:#676767;" onclick=" document.getElementById('pt-wrapper').classList.toggle('hidden');">
                        <i class="fa fa-times"></i>
                    </a>
    
                    </div>
                </div>
            `);
    
            document.getElementById("pt-wrapper").style.display = "flex";
            $("#pt-wrapper").draggable();
            $("#pt-wrapper").css("top", $("body").height() - 420);
        
        }
    
    }


    _displayResult(dataForDisplay, selectedPolyline) {
        if (document.getElementById("pt-wrapper").classList.contains("hidden")) {
            document.getElementById("pt-wrapper").classList.toggle("hidden");
        }

        const inner = document.createElement("div");
        inner.id = selectedPolyline;

        document.getElementById("elevationProfile").appendChild(inner);
        $('#'+inner.id).highcharts({
            credits: { enabled: false },
            lang: {
                viewFullscreen: "Pantalla Completa",
                printChart: "Imprimir",
                downloadCSV: "Descargar en CSV",
                downloadJPEG: "Descargar en JPG",
                downloadPDF: "Descargar en PDF",
                downloadPNG: "Descargar en PNG",
                downloadSVG: "Descargar en SVG",
                downloadXLS: "Descargar en XLS"
            },
            chart: {
                zoomType: 'x',
                backgroundColor: 'rgba(255, 255, 255, 0.0)',
            },
            title: {
                //text: 'Perfil Topográfico',
                text: '',
                style: {
                    fontSize: "15px",
                    color: '#FFFFFF'
                }
            },
            subtitle: {
                //text: 'Distancia Total: ' + data.distancia_total + "Km.",
                text: '',
                style: {
                    //color:'#FFFFFF'
                    color: '#000000'
                }
            },
            xAxis: {
                //type: 'distancia',
                title: {
                    text: 'Distancia (km)'
                }
            },
            yAxis: {
                //type: 'altura',
                title: {
                    text: 'Altura (m)'
                }
            },
            legend: {
                enabled: true
            },
            tooltip: {
                formatter: function () {
                    return 'Altura ' + this.y + ' (m) <br>Distancia ' + this.x + ' (Km)';
                },
                shared: true
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },

            series: [{
                type: 'area',
                name: 'Altura',
                data: dataForDisplay,
                point: {
                    events: {
                        mouseOver: function (event) {
                            mapa.markerPerfilTopografico = L.marker([event.target.lng, event.target.lat]).addTo(mapa);
                        },
                        mouseOut: function () {
                            mapa.markerPerfilTopografico.remove();
                        }
                    }
                }
            }]
        });
    
    }

    getGeoJSON() { // would be moved to the Layer class as part of export method
        const geoJSON = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: [],
              },
            },
          ],
        };
    
        let coords = [];
        this.data.forEach(point => {
           let coord = [ point.lat, point.lng, point.y ];
            geoJSON.features[0].geometry.coordinates.push(coord);
        });

        console.log(geoJSON);
    }

    addGeoprocessLayer(groupname, textName, id, fileName){
        let groupnamev= clearSpecialChars(groupname);
        let main = document.getElementById("lista-"+groupnamev)

        let div = ` 
        <div style="display:flex; flex-direction:row;">
        <div style="cursor: pointer; width: 70%" onclick="clickDisplayResult('${id}')"><span style="user-select: none;">${id}</span></div>
        <div class="icon-layer-geo" onclick="mapa.downloadMultiLayerGeoJSON('${id}')"><i class="fas fa-download" title="descargar"></i></div>
        <div class="icon-layer-geo" onclick="deleteLayerGeometry('${id}')"><i class="far fa-trash-alt" title="eliminar"></i></div>
        </div>
        `
        //si no existe contenedor
        let id_options_container = "opt-c-"+id
        if(!main){menu_ui.addSection(groupnamev)}
        let content = document.getElementById(groupnamev+"-panel-body")
             let layer_container = document.createElement("div")
             layer_container.id = "fl-" +id
             layer_container.className = "file-layer-container"

             let layer_item = document.createElement("div")
             layer_item.id = "flc-" +id
             layer_item.className = "file-layer active"
              
             let img_icon =document.createElement("div")
             img_icon.className = "file-img"
             img_icon.innerHTML = `<img loading="lazy" src="src/js/components/openfiles/icon_file.svg">`
             img_icon.onclick = ()=> {
                this.clickDisplayResult(id);
             }

            let layer_name = document.createElement("div")
            layer_name.className = "file-layername"
            layer_name.innerHTML= "<a>"+textName+"</a>"
            layer_name.title = fileName
            layer_name.onclick = ()=> {
                this.clickDisplayResult(id);
             }
            
            let options = document.createElement("div")
            options.style = "width:10$;padding-right:5px;cursor:pointer;"
            options.className = "btn-group"
            options.role ="group"
            options.id = id_options_container

            let fdiv = document.createElement("div")
            fdiv.style = "border: 0px;"
            fdiv.className = "dropdown-toggle"
            fdiv.setAttribute('data-toggle', 'dropdown')
            fdiv.setAttribute('aria-haspopup', 'true')
            fdiv.setAttribute('aria-expanded', 'false')
            fdiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16"> <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/> </svg>'

            let mainul = document.createElement("ul")
            mainul.className = "dropdown-menu"
            mainul.style = "right:0px !important;left:auto !important;"
            mainul.id = "opt-c-"+id

            let delete_opt = document.createElement("li")
            delete_opt.innerHTML = `<a style="color:#474b4e;" href="#"><i  class="fa fa-trash" aria-hidden="true" style="width:20px;"></i>Eliminar Capa</a>`
            delete_opt.onclick = function(){
                let menu = new Menu_UI
                menu.modalEliminar(id)
            }

            let download_opt = document.createElement("li")
            download_opt.innerHTML =`<a style="color:#474b4e;" href="#"><i class="fa fa-download" aria-hidden="true" style="width:20px;"></i>Descargar .geojson</a>`
            download_opt.onclick = function(){
                let index_file = getIndexFileLayerbyID(id)
                let d_file_name = addedLayers[index_file].name
                mapa.downloadMultiLayerGeoJSON(id,addedLayers[index_file].name,true)
            }

            let edit_name_opt = document.createElement("li")
            edit_name_opt.innerHTML =`<a style="color:#474b4e;" href="#"><i class="fa fa-edit" aria-hidden="true" style="width:20px;"></i>Editar Nombre</a>`
            edit_name_opt.onclick = function(){
                menu_ui.editFileLayerName(id)
            }

            let zoom_layer_opt = document.createElement("li")
            zoom_layer_opt.innerHTML =`<a style="color:#474b4e;" href="#"><i class="fa fa-search-plus" aria-hidden="true" style="width:20px;"></i>Zoom a capa</a>`
            zoom_layer_opt.onclick = function(){
                addedLayers.forEach( lyr => {
                    if( lyr.id === id ) {
                        mapa.centerLayer(lyr.layer);
                    }
                });
            }

            mainul.append(zoom_layer_opt)
            mainul.append(edit_name_opt)
            mainul.append(download_opt)
            mainul.append(delete_opt)
            
            options.append(fdiv)
            options.append(mainul)
                      
            layer_item.append(img_icon)
            layer_item.append(layer_name)
            layer_item.append(options)
            layer_container.append(layer_item)
            content.appendChild(layer_container)
    }

    
}
