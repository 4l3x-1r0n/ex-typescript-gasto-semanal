//variables y selectores
const form = document.querySelector("#agregar-gasto") as HTMLFormElement;
const gastolistado_ul = document.querySelector("#gastos ul") as HTMLUListElement;


// eventos
eventListeners();
function eventListeners(): void {
    document.addEventListener("DOMContentLoaded", preguntarPresupuesto);
    form.addEventListener("submit", agregarGasto);
}

// clasese
type TipoAlerta = "error" | "success";

interface Gasto {
    nombreGasto: string;
    cantidad: number;
    id: number;
}

interface IPresupuesto {
    presupuesto: number;
    restante: number;
    gastos: Gasto[];
}

class Presupuesto implements IPresupuesto {
    restante: number;
    gastos: Gasto[] = [];
    constructor(public presupuesto: number) {
        this.restante = presupuesto;
    }

    nuevoGasto(gasto: Gasto): Gasto[] {
        this.gastos.push(gasto);
        this.calcularRestante();
        return this.gastos;
    }

    calcularRestante() {
        const gastado = this.gastos.reduce((total, gasto) => total += gasto.cantidad, 0);
        this.restante = this.presupuesto - gastado;
        console.log(this.restante);
    }
    eliminarGasto(id: number) {
        this.gastos = this.gastos.filter((gasto) => gasto.id !== id);
        this.calcularRestante();
    }

}

class UI {
    mostrarPresupuesto(presupuesto: number) {
        (document.querySelector("#total") as HTMLSpanElement).textContent = presupuesto.toString();
        this.mostrarRestante(presupuesto);

    }
    mostrarRestante(restante: number) {
        (document.querySelector("#restante") as HTMLSpanElement).textContent = restante.toString();
    }

    comprobarPresupuesto(presupuestoObj: IPresupuesto) {
        const { presupuesto, restante } = presupuestoObj;
        const restanteDiv = document.querySelector(".restante") as HTMLDivElement;

        //si el total es cero o menor
        if (restante <= 0) {
            ui.showAlert("El presupuesto se ha agotado", "error");
            (form.querySelector("button[type = \"submit\"") as HTMLInputElement).disabled = true;
        } else {
            (form.querySelector("button[type = \"submit\"") as HTMLInputElement).disabled = false;
        }

        if ((presupuesto / 4) > restante) {
            restanteDiv.classList.remove("alert-success", "alert-warning");
            restanteDiv.classList.add("alert-danger");
            return;
        }
        if ((presupuesto / 2) > restante) {
            restanteDiv.classList.remove("alert-success", "alert-danger");
            restanteDiv.classList.add("alert-warning");
            return;
        }
        restanteDiv.classList.remove("alert-danger", "alert-warning");
        restanteDiv.classList.add("alert-success");


    }

    showAlert(msg: string, tipo: TipoAlerta) {
        (document.querySelector("form .alert-danger, form .alert-success") as HTMLElement)?.remove();

        const msg_div = document.createElement("div");

        msg_div.classList.add(tipo === "error" ? "alert-danger" : "alert-success");

        msg_div.classList.add("text-center", "alert");
        msg_div.textContent = msg;
        form.prepend(msg_div);
        setTimeout(() => {
            msg_div.remove();
        }, 3000);
    }

    mostrarGastos(gastos: Gasto[]) {
        this.limpiarHtml();
        gastos.forEach((gasto) => {
            const { nombreGasto, cantidad, id } = gasto;

            const nuevoGasto = document.createElement("li");
            nuevoGasto.className = "list-group-item d-flex justify-content-between align-items-center";

            //nuevoGasto.setAttribute("data-id", id.toString()); //para los atributos data se usa la siguiente instruccion
            nuevoGasto.dataset.id = id.toString();//el texto que ponemos despues de nuevoGasto.dataset.    nos pondra ese texto despues del data-   en el html, en este cado nos crea lo sigiente data-id, si por ejemoplo ponemos nuevoGasto.dataset.date, se nos creara en el html data-date
            nuevoGasto.innerHTML = `
            ${nombreGasto} <span class="badge badge-primary badge-pill">$${cantidad}</span>
            `;

            const btnBorrar = document.createElement("button");
            btnBorrar.classList.add("btn", "btn-danger", "borrar-gasto");
            btnBorrar.innerHTML = "Borrar &times";
            btnBorrar.onclick = () => eliminarGasto(id);

            nuevoGasto.append(btnBorrar);
            gastolistado_ul.append(nuevoGasto);

            // const agregarBtn = document.querySelector(".btn-primaty") as HTMLButtonElement;

        });
    }

    limpiarHtml() {
        while (gastolistado_ul.firstChild) {
            gastolistado_ul.removeChild(gastolistado_ul.firstChild);
        }
    }
}

const ui = new UI();
let presupuesto: Presupuesto;//objeto presupuesto, lo instanciamos cuando leamos el valor del presupuesto


// funciones
function preguntarPresupuesto(): void {

    const presupuestoLeido = +(prompt("¿Cual es tu presupuesto?") ?? "");
    if (!presupuestoLeido || presupuestoLeido < 1) {
        window.location.reload();
    }
    presupuesto = new Presupuesto(presupuestoLeido);

    ui.mostrarPresupuesto(presupuesto.presupuesto);
}

function agregarGasto(e: Event): void {
    e.preventDefault();
    //leer datos del formulario
    const nombreGasto = (document.querySelector("#gasto") as HTMLInputElement).value;
    const cantidad = (document.querySelector("#cantidad") as HTMLInputElement).value;



    if (!nombreGasto || cantidad === "") {
        ui.showAlert("Ambos Campos son obligatorios", "error");
        return;
    }
    if (!+cantidad || +cantidad < 1) {
        ui.showAlert("Entre una cantidad valida", "error");
        return;
    }

    // creamos un objeto con el nombre del gasto  y la cantidad
    const gasto: Gasto = {//object literal enhancement(cuando las propiedades tienen le mismo nombre que el valor que le asignaremos, se pueden evitar los : y el nombre del valor)
        nombreGasto,
        cantidad: +cantidad,
        id: Date.now()
    };

    presupuesto.nuevoGasto(gasto);

    ui.mostrarGastos(presupuesto.gastos);
    ui.mostrarRestante(presupuesto.restante);
    ui.comprobarPresupuesto(presupuesto);

    ui.showAlert("Gasto agregado Correctamente", "success");
    form.reset();
}

function eliminarGasto(id: number) {
    presupuesto.eliminarGasto(id);
    ui.mostrarGastos(presupuesto.gastos);
    ui.mostrarRestante(presupuesto.restante);
    ui.comprobarPresupuesto(presupuesto);
}
