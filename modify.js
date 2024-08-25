// Global Variables to hold grid API and grid options
let gridApi;
let gridColumnApi;
let gridOptions;

let dataToSave = [];
async function getData(category = "sec") {
    const url = `./${category}.json`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        return json; // Return the data to be used later
    } catch (error) {
        console.error(error.message);
        return []; // Return an empty array or handle the error as needed
    }
}

// Initialize the Grid when the DOM is ready
document.addEventListener("DOMContentLoaded", async function () {
    const gridDiv = document.querySelector("#myGrid");

    // Fetch initial data and set up grid options
    let rowDatafromJson = await getData(); // Await the data fetching
    console.log("rowDatafromJson", rowDatafromJson);

    gridOptions = {
        rowData: rowDatafromJson, // Use the fetched data directly
        columnDefs: [
            { field: "CODICE MECCANOGRAFICO", rowDrag: true },
            { field: "ARBITRO" },
            { field: "POSIZIONE" },
        ],
        defaultColDef: {
            flex: 1,
            sortable: true,
            filter: true,
        },
        rowDragManaged: true,
        onGridReady: function (params) {
            gridApi = params.api; // Assign the grid API to the global variable
            gridColumnApi = params.columnApi; // Assign the column API to the global variable
        },
        onRowDragEnd: onRowDragEnd, // Event handler for row drag end
    };

    new agGrid.Grid(gridDiv, gridOptions); // Initialize the grid with options
});

// Function to handle the row drag end event
function onRowDragEnd(event) {
    // Update the POSIZIONE field of each row based on its index
    gridApi.forEachNode((node, index) => {
        node.setDataValue("POSIZIONE", index + 1); // Update the POSIZIONE directly
    });

    // Refresh cells to show the updated POSIZIONE values
    gridApi.refreshCells({ columns: ["POSIZIONE"] });

    // Log all data in the table
    dataToSave = [];
    gridApi.forEachNode((node) => {
        dataToSave.push(node.data);
    });
    console.log("Updated table data:", dataToSave);
}

// Event listener for category button click

const categories = ["sec", "ter", "jur", "jup", "alr", "alp", "gir", "gip"];
const buttonContainer = document.querySelector(".buttonContainer");

categories.forEach((category) => {
    // Create a button element
    const button = document.createElement("button");

    // Set the button's text
    button.textContent = category;
    button.id = category;

    button.addEventListener("click", async (x) => {
        let title = document.getElementById("currentCategory");
        title.innerText = "Elenco Arbitri per la categoria: " + x.target.id;
        const button = document.createElement("button");

        const newRowData = await getData(x.target.id); // Fetch new data based on button ID
        if (gridApi) {
            // Remove all existing rows
            const currentData = [];
            gridApi.forEachNode((node) => currentData.push(node.data));
            gridApi.applyTransaction({ remove: currentData });

            // Add the new data
            gridApi.applyTransaction({ add: newRowData });
        }
    });

    // Append the button to the container
    buttonContainer.appendChild(button);
});

const saveButton = document.getElementById("save");
saveButton.addEventListener("click", async (event) => {
    console.log("click", dataToSave);
    event.preventDefault();
    try {
        const response = await axios.post("http://localhost:3000/saveData", {
            filename: currentCategory.innerText.split(": ")[1],
            content: dataToSave,
        });

        if (response.status === 200) {
            console.log("Data successfully saved.");
        } else {
            console.error("Error saving data:", response.statusText);
        }
    } catch (error) {
        console.log("error", error);
    }
});