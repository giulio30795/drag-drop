// Global Variables to hold grid API and grid options
let gridApi;
let gridColumnApi;
let gridOptions;
const saveButton = document.getElementById("save");
var dataToSave = [];
// Function to fetch data
async function getData(category = "sec") {
    const url = `./${category}.json`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        initialData = json;
        console.log("dataToSave", dataToSave);
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

    // Define grid options
    const gridOptions = {
        rowData: rowDatafromJson, // Use the fetched data directly
        columnDefs: [
            {
                field: "CODICE MECCANOGRAFICO",
                rowDrag: true,
                wrapText: true,
                autoHeight: true,
                minWidth: 250,
            },
            {
                field: "ARBITRO",
                wrapText: true,
                autoHeight: true,
            },
            {
                field: "POSIZIONE",
                wrapText: true,
                autoHeight: true,
            },
            {
                field: "NOTA",
                wrapText: true, // Enables text wrapping in the cell
                autoHeight: true, // Automatically adjusts row height based on content
                flex: 1, // Makes the NOTA column take the remaining space
            },
        ],
        defaultColDef: {
            sortable: true,
            filter: true,
            resizable: true, // Ensure columns are resizable
        },
        domLayout: "autoHeight", // The grid will adjust its height to the number of rows
        rowDragManaged: true,
        onGridReady: function (params) {
            gridApi = params.api; // Assign the grid API to the global variable
            gridColumnApi = params.columnApi; // Assign the column API to the global variable

            // Automatically size specific columns to fit their content
            gridColumnApi.autoSizeColumns(["CODICE MECCANOGRAFICO", "ARBITRO", "POSIZIONE"]);

            // Adjust grid height after initial render
            adjustGridHeight();
        },

        onRowDragEnd: onRowDragEnd, // Event handler for row drag end
        onFirstDataRendered: adjustGridHeight, // Adjust grid height on first data render
    };

    new agGrid.Grid(gridDiv, gridOptions); // Initialize the grid with options
});

// Function to adjust the grid height based on the content
function adjustGridHeight() {
    // Set the grid height dynamically
    const gridDiv = document.querySelector("#myGrid");
    gridDiv.style.height = "";
    gridApi.sizeColumnsToFit();
}

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

    // Adjust grid height after row drag
    adjustGridHeight();
    saveButton.classList.remove("hidden");
}

// Event listener for category button click
const categories = ["sec", "ter", "jur", "jup", "alr", "alp", "gir", "gip"];
const buttonContainer = document.querySelector(".buttonContainer");

categories.forEach((category) => {
    // Create a button element
    const button = document.createElement("button");
    button.classList.add("categoryButton");

    // Set the button's text
    button.textContent = category;
    button.id = category;

    button.addEventListener("click", async (x) => {
        saveButton.classList.add("hidden");
        let title = document.getElementById("currentCategory");
        title.innerText = "Elenco Arbitri per la categoria: " + x.target.id;

        const newRowData = await getData(x.target.id); // Fetch new data based on button ID
        if (gridApi) {
            // Remove all existing rows
            const currentData = [];
            gridApi.forEachNode((node) => currentData.push(node.data));
            gridApi.applyTransaction({ remove: currentData });

            // Add the new data
            gridApi.applyTransaction({ add: newRowData });

            // Adjust grid height after new data is loaded
            adjustGridHeight();
        }
    });

    // Append the button to the container
    buttonContainer.appendChild(button);
});

saveButton.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
        const response = await axios.post("http://localhost:3000/saveData", {
            filename: currentCategory.innerText.split(": ")[1],
            content: dataToSave,
        });

        if (response.status === 200) {
            console.log("Data successfully saved.");
            showToast("Salvataggio Riuscito");
        } else {
            console.error("Error saving data:", response.statusText);
        }
    } catch (error) {
        console.log("error", error);
    }
});

function showToast(text) {
    let toast = document.querySelector("toast");
    toast.innerText = text;
    toast.classList.remove("hidden");

    setTimeout(toast.classList.add("hidden"), 2500);
}
