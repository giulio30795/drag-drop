// Global Variables to hold grid API and grid options
let gridApi;

// Grid Options: Contains all of the grid configurations
const gridOptions = {
    // Data to be displayed
    rowData: [
        { name: "Marco", position: 1 },
        { name: "Giovanni", position: 2 },
        { name: "Mattia", position: 3 },
    ],
    // Columns to be displayed (Should match rowData properties)
    columnDefs: [{ field: "name", rowDrag: true }, { field: "position" }],
    defaultColDef: {
        flex: 1,
    },
    rowDragManaged: true,
    onGridReady: function (params) {
        gridApi = params.api; // Assign the grid API to the global variable
    },
    onRowDragEnd: onRowDragEnd, // Event handler for row drag end
};

// Function to handle the row drag end event
function onRowDragEnd(event) {
    // Update the position field of each row based on its index
    gridApi.forEachNode((node, index) => {
        node.setDataValue("position", index + 1); // Update the position directly
    });

    // Refresh cells to show the updated position values
    gridApi.refreshCells({ columns: ["position"] });
}

// Initialize the Grid when the DOM is ready
document.addEventListener("DOMContentLoaded", function () {
    const gridDiv = document.querySelector("#myGrid");
    new agGrid.Grid(gridDiv, gridOptions);
});
