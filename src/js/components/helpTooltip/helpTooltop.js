const options1 = {
    welcomeText: "¿Quieres iniciar un tutorial rápido?",
    confirmText: "Si",
    cancelText: "No",
    backdropColor: '#6262625d',
    sequence: [{ element: '#fullscreen', description: "<h2>Don't forget to import!</h2><div>Add these lines when using in a front end framework.</div>", placement: 'right' }, { element: '#help', description: "<h2>Color, color, everywhere! ❤️🧡💛💚💙💜💗🖤</h2><div>Option to choose the backdrop color.</div>", placement: 'left' }],
    onComplete: function () { console.log("Completed!") }
}

class TooltipHelper {
    constructor() {
        this.cont = 0;
        this.data = {
            welcomeText: "Do you want to take the tour of the page?",
            confirmText: "SI",
            cancelText: "No",
            backdropColor: "#1b1b1b8e",
            sequence: [{ element: '#help', description: "<h2>Color, color, everywhere! ❤️🧡💛💚💙💜💗🖤</h2><div>Option to choose the backdrop color.</div>", placement: 'left' }],
            onComplete: function () { },
        };
    }

    createTooltip() {
        const { sequence: sequence } = this.data; //Toma las secuencias
        const element = sequence[this.cont]; //Toma un elemento del array de secuencias
        const { element: elemId, description: description } = element; //Toma el id y el contendido del elemento
        const tooltipContainer = document.getElementById("tooltip-helper-backdrop"); //toma el fondo
        let divPos = { x: 0, y: 0 };
        let correctedPos = { x: 0, y: 0 };
        let arrowPos = element.hasOwnProperty("placement") ? element.placement : "bottom"; //Toma la posicion de la fecla

        window.innerWidth <= 400 && ("left" === arrowPos || "right" === arrowPos) && (arrowPos = "bottom"); //Chequea tamaño de pantalla y lo cambia si necesita

        const item = document.querySelector(elemId); //Toma el id del elemento
        if (!item) return this.close(); // Consulta si existe ele elemento

        document.querySelector("body").classList.add("stop-scroll");
        item.scrollIntoView({ behaviour: "smooth", block: "center" });

        const style = getComputedStyle(item); //Tomas los estilos
        const itemSize = item.getBoundingClientRect();
        const highlightItem = ((tooltipContainer, itemSize, style) => {
            const { backdropColor: backdropColor } = this.data;
            let tooltipActive = document.querySelector(
                "#tooltip-helper-backdrop .tooltip-helper-active"
            );
            if (!tooltipActive) {
                tooltipActive = document.createElement("div");
                tooltipActive.setAttribute("id", "tooltip-helper-active");
                tooltipActive.classList.add("tooltip-helper-active");
                tooltipContainer.append(tooltipActive);
            }
            tooltipActive.style.top = Math.round(itemSize.top) + "px";
            tooltipActive.style.left = Math.round(itemSize.left) + "px";
            tooltipActive.style.height = itemSize.height + "px";
            tooltipActive.style.width = itemSize.width + "px";
            tooltipActive.style.borderRadius = style.borderRadius;
            tooltipActive.style.boxShadow = "0 0 0 9999px " + backdropColor;
            return tooltipActive;
        })(tooltipContainer, itemSize, style);

        const tooltipDiv = ((tooltipContainer, description) => {
            const { sequence: sequence } = this.data;
            let descriptionDiv = document.querySelector(
                "#tooltip-helper-backdrop .tooltip-helper-active-description"
            );
            if (!descriptionDiv) {
                descriptionDiv = document.createElement("div");
                descriptionDiv.style.willChange = "transform";
                descriptionDiv.classList.add("tooltip-helper-active-description");
                descriptionDiv.innerHTML += "<p id='tooltip-helper-active-description-text'></p>";
                descriptionDiv.innerHTML +=
                    '<div class="tooltip-helper-footer"><button id="tooltip-helper-end-sequence" class="tooltip-helper-end-sequence">Cerrar</button><div><button id="tooltip-helper-prev-sequence" class="tooltip-helper-prev-sequence">Anterior</button><button id="tooltip-helper-next-sequence" class="tooltip-helper-next-sequence ml-2">Siguiente</button></div></div>';
                tooltipContainer.append(descriptionDiv);
            }

            const prevSequence = document.getElementById("tooltip-helper-prev-sequence");
            const nextSequence = document.getElementById("tooltip-helper-next-sequence");

            if (this.cont === 0) {
                prevSequence.setAttribute("disabled", true);
                prevSequence.classList.add("tooltip-disabled-btn");
                nextSequence.innerText = sequence.length === 1 ? "Finalizar" : "Siguiente";
            } else {
                prevSequence.removeAttribute("disabled", true);
                prevSequence.classList.remove("tooltip-disabled-btn");
                nextSequence.innerText = this.cont === sequence.length - 1 ? "Finalizar" : "Siguiente";
            }
            document.getElementById("tooltip-helper-active-description-text").innerHTML = description;
            return descriptionDiv;
        })(tooltipContainer, description);

        const helperArrow = (tooltipContainer => {
            let helperArrow = document.querySelector("#tooltip-helper-backdrop #tooltip-helper-arrow");
            if (!helperArrow) {
                helperArrow = document.createElement("div");
                helperArrow.setAttribute("id", "tooltip-helper-arrow");
                tooltipContainer.append(helperArrow);
            }
            return helperArrow;
        })(tooltipContainer);

        divPos = ((item, tooltipDiv, arrowPos) => {
            let _itemSize = item.getBoundingClientRect();
            let _tooltipDivSize = tooltipDiv.getBoundingClientRect();
            let pos = { x: 0, y: 0 };
            let sizeDifference = _tooltipDivSize.width > _itemSize.width ? -1 : 1;
            const _width = Math.round(
                _itemSize.x + sizeDifference * Math.abs(_itemSize.width - _tooltipDivSize.width) / 2
            );
            switch (arrowPos) {
                case "top":
                    pos.x = _width;
                    pos.y = Math.round(_itemSize.y - _tooltipDivSize.height - 15);
                    break;
                case "right":
                    pos.x = Math.round(_itemSize.x + _itemSize.width + 15);
                    pos.y = Math.round(_itemSize.y + _itemSize.height / 2 - _tooltipDivSize.height / 2);
                    break;
                case "bottom":
                    pos.x = _width;
                    pos.y = Math.round(_itemSize.y + _itemSize.height + 15);
                    break;
                case "left":
                    pos.x = Math.round(_itemSize.x - _tooltipDivSize.width - 15);
                    pos.y = Math.round(_itemSize.y + _itemSize.height / 2 - _tooltipDivSize.height / 2);
                    break;
                default:
                    pos.x = _width;
                    pos.y = Math.round(_itemSize.y - _tooltipDivSize.height - 15);
            }
            return pos;
        })(item, tooltipDiv, arrowPos);

        let divSize = tooltipDiv.getBoundingClientRect();

        if (divPos.x + divSize.width >= window.innerWidth) {
            divPos.x = Math.round(itemSize.right - divSize.width + 15);
        } else if (divPos.x <= 0) {
            divPos.x = Math.round(itemSize.x - 15);
            if (divSize.width >= window.innerWidth) {
                tooltipDiv.style.width = window.innerWidth - 2 * divPos.x + "px";
            }
        }

        tooltipDiv.style.transform = "translate3d(" + divPos.x + "px, " + divPos.y + "px, 0px)";

        correctedPos = ((helperArrow, arrowPos, divPos, highlightItem, tooltipDiv) => {
            let pos = { x: 0, y: 0 };
            let highlightItemSize = highlightItem.getBoundingClientRect();
            let tooltipDivSize = tooltipDiv.getBoundingClientRect();
            switch (arrowPos) {
                case "top":
                    helperArrow.removeAttribute("class");
                    helperArrow.classList.add(
                        "tooltip-helper-arrow",
                        "tooltip-helper-arrow-down"
                    );
                    pos.x = Math.round(highlightItemSize.x + highlightItemSize.width / 2 - 20);
                    pos.y = Math.round(divPos.y + tooltipDivSize.height - 10);
                    break;
                case "right":
                    helperArrow.removeAttribute("class");
                    helperArrow.classList.add(
                        "tooltip-helper-arrow",
                        "tooltip-helper-arrow-left"
                    );
                    pos.x = Math.round(divPos.x - 10);
                    pos.y = Math.round(highlightItemSize.y + highlightItemSize.height / 2 - 20);
                    break;
                case "bottom":
                    helperArrow.removeAttribute("class");
                    helperArrow.classList.add(
                        "tooltip-helper-arrow",
                        "tooltip-helper-arrow-up"
                    );
                    pos.x = Math.round(highlightItemSize.x + highlightItemSize.width / 2 - 20);
                    pos.y = Math.round(divPos.y - 10);
                    break;
                case "left":
                    helperArrow.removeAttribute("class");
                    helperArrow.classList.add(
                        "tooltip-helper-arrow",
                        "tooltip-helper-arrow-right"
                    );
                    pos.x = Math.round(divPos.x + tooltipDivSize.width - 10);
                    pos.y = Math.round(highlightItemSize.y + highlightItemSize.height / 2 - 20);
                    break;
                default:
                    helperArrow.removeAttribute("class");
                    helperArrow.classList.add(
                        "tooltip-helper-arrow",
                        "tooltip-helper-arrow-up"
                    );
                    pos.x = Math.round(highlightItemSize.x + highlightItemSize.width / 2 - 20);
                    pos.y = Math.round(divPos.y - 10);
            }
            return pos;
        })(helperArrow, arrowPos, divPos, highlightItem, tooltipDiv);
        helperArrow.style.transform =
            "translate3d(" + correctedPos.x + "px, " + correctedPos.y + "px, 0px)";

        if (sequence.hasOwnProperty("events") && sequence.events.hasOwnProperty("on")) {
            sequence.events.on(sequence);
        }
    };

    /**
      * Closes the tooltip helper and performs cleanup actions.
      */
    close = () => {
        document.querySelector("body").classList.remove("stop-scroll"); // Remove the "stop-scroll" class from the body element

        const backdrop = document.getElementById("tooltip-helper-backdrop"); // Find the backdrop element by its ID

        backdrop.remove(); // Remove the backdrop element from the DOM

        this.cont = 0; // Reset the counter

        this.data.onComplete(); // Call the onComplete callback function
    };

    /**
      * Moves to the next or previous tooltip in the sequence based on the given offset.
      * @param {number} secuncyPos - The offset to move in the sequence. Positive for next, negative for previous.
      */
    secuncyPos = (secuncyPos) => {
        const { sequence } = this.data;

        this.cont += secuncyPos; // Update the counter by adding the offset

        // Check if the counter is within the valid sequence range
        if (this.cont >= 0 && this.cont <= sequence.length - 1) {
            this.createTooltip(sequence[this.cont]); // Create the tooltip for the current step in the sequence
        } else {
            document.querySelector(sequence[this.cont - 1 * secuncyPos].element).classList.remove("tooltip-helper-active-element"); // Remove the "tooltip-helper-active-element" class from the previous element

            document.getElementById("tooltip-helper-backdrop").removeEventListener("click", this.handleBackdropClick); // Remove the event listener for backdrop click

            this.close(); // Close the tooltip helper
        }
    };


    createSequence = (options) => {
        this.data = { ...this.data, ...options };
        const tooltipBackdrop = document.createElement('div');
        tooltipBackdrop.id = 'tooltip-helper-backdrop';
        tooltipBackdrop.classList.add('tooltip-helper-backdrop');

        document.querySelector('body').appendChild(tooltipBackdrop);

        document.getElementById("tooltip-helper-backdrop").addEventListener("click", e => {
            switch (e.target.id) {
                case "tooltip-helper-next-sequence": return this.secuncyPos(1);
                case "tooltip-helper-prev-sequence": return this.secuncyPos(-1);
                case "tooltip-helper-end-sequence":
                case "tooltip-helper-active":
                case "tooltip-helper-backdrop": return this.close();
                default: return
            }
        })

        this.createTooltip();
    };

};
class HelpTooltip {
    constructor() {
        this.component = `
            <a id="iconHelp-container" title="Ayuda" onclick="handleClick(event)">
                  <i id="iconHelp" class="fa-solid fa-question" aria-hidden="true"></i>
            </a>
            `;
    }

    createComponent() {
        const elem = document.createElement("div");
        elem.className = "leaflet-bar leaflet-control";
        elem.id = "help";
        elem.innerHTML = this.component;
        document.querySelector(".leaflet-top.leaflet-right").append(elem);
    }
}

function handleClick(event) {
    event.stopPropagation();
    event.preventDefault();
    const tooltipHelper = new TooltipHelper();
    tooltipHelper.createSequence(options1);
};