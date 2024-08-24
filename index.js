// Global Variables to hold grid API and grid options
let gridApi;
let gridColumnApi;

let dataToSave = [];

async function getData() {
    const url = "./arbitri.json";
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

    // Fetch data and set up grid options
    const rowDatafromJson = await getData(); // Await the data fetching
    console.log("rowDatafromJson", rowDatafromJson);

    const gridOptions = {
        // Initially empty rowData and columnDefs
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

    // Log all data in the tabl
    dataToSave = [];
    gridApi.forEachNode((node) => {
        dataToSave.push(node.data);
    });
    console.log("Updated table data:", dataToSave);
}

const saveButton = document.getElementById("save");

saveButton.addEventListener("click", async () => {
    console.log("click");
    try {
        const response = await fetch(`http://localhost:3000/saveData`, {
            // Adjust the URL to match your server endpoint
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSave),
        });

        if (response.ok) {
            console.log("Data successfully saved.");
        } else {
            console.error("Error saving data:", response.statusText);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
});
