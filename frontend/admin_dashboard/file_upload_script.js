document.addEventListener("DOMContentLoaded", async () => {
await uploadFile();
await loadFiles();
});


async function uploadFile() {
    document.getElementById("upload_button").addEventListener("click", async (event) => {
        event.preventDefault();
    
        const fileInput = document.getElementById("uploadContent").files[0];
        const title = fileInput.name;
    
        if (!title || !fileInput) {
            alert("Please enter a title and select a file.");
            return;
        }
    
        const formData = new FormData();
        formData.append("title", title);
        formData.append("file", fileInput);

        var uploadType = "file_document";

    
        try {
            const response = await fetch(`http://localhost:5000/uploads/file_upload?uploadType=${uploadType}`, {
                method: "POST",
                body: formData,
            });
    
            const data = await response.json();
    
            if (response.ok) {
                console.log(`File uploaded successfully: ${data.filePath}`);
                loadFiles(); // Refresh the file list after upload
            } else {
                console.log("Upload failed:");
            }
        } catch (error) {
            console.error("Error:", error);
            document.getElementById("statusMessage").textContent = "Upload failed. Please try again.";
        }
    });
    
}

// Function to load and display uploaded files
const loadFiles = async () => {
        
    try {
        const response = await fetch("http://localhost:5000/uploads/get_files");
        const files = await response.json();

        const fileList = document.getElementById("contentList");
        fileList.innerHTML = ""; // Clear previous list

        if (files.length === 0) {
            fileList.innerHTML = "<li>No files found</li>";
            return;
        }

        files.forEach(file => {
            const listItem = document.createElement("li");

            // Create a download/view link
            const fileLink = document.createElement("a");
            fileLink.href = `http://localhost:5000/backend${file.file_path}`;
            fileLink.textContent = file.title;
            fileLink.target = "_blank"; // Opens file in a new tab

            listItem.appendChild(fileLink);
            fileList.appendChild(listItem);
        });

    } catch (error) {
        console.error("Error fetching files:", error);
        document.getElementById("fileList").innerHTML = "<li>Error loading files</li>";
    }
};