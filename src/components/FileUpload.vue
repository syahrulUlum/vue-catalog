<template>
    <div id="upload-container">
        <!-- Loop through the files array and generate upload boxes dynamically -->
        <div v-for="(file, index) in files" :key="index" class="upload-wrapper">
            <div class="upload-box">
                <!-- File input (hidden), triggers by label or button -->
                <input v-bind:id="'file-input-' + index" type="file" class="file-input" accept="image/*"
                    ref="fileInputs" @change="handleFileChange(index)" />
                <label v-if="!file.preview" class="upload-button" :for="'file-input-' + index">
                    +
                </label>

                <!-- Display image preview if a file has been selected -->
                <img v-if="file.preview" :src="file.preview" class="preview-image" style="display: block;" />

                <div v-if="file.preview" class=" position-absolute top-0 right-0">
                    <button class="text-blue  mb-1" @click="chooseAnotherFile(index)">
                        <v-icon icon="mdi-square-edit-outline"></v-icon>
                    </button>
                    <button class="text-red " @click="removeFile(index)">
                        <v-icon icon="mdi-delete"></v-icon>
                    </button>
                </div>
            </div>

            <!-- Choose another file, remove file -->
            <!-- <div v-if="file.preview" class="actions">
                <button class="edit-btn" @click="chooseAnotherFile(index)">
                    <v-icon icon="mdi-square-edit-outline"></v-icon>
                </button>
                <button class="delete-btn" @click="removeFile(index)">
                    <v-icon icon="mdi-delete"></v-icon>
                </button>
            </div> -->
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const emit = defineEmits();
const props = defineProps({
    initialFiles: Array // Prop for get old image
});

const files = ref([{ preview: null, file: null }]);

const ensureEmptyUploadBox = () => {
    if (!files.value.some(file => !file.file && !file.preview)) {
        files.value.push({ preview: null, file: null });
    }
};
// Watch untuk initialFiles dari parent
watch(
    () => props.initialFiles,
    (newFiles) => {
        if (newFiles && newFiles.length > 0) {
            files.value = newFiles.map(file => ({
                preview: file || null,
                file: null
            }));
        }
        ensureEmptyUploadBox();
    },
    { immediate: true }
);

// Handle file input change
const handleFileChange = (index) => {
    const fileInput = document.getElementById(`file-input-${index}`);
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Update file preview and data
            files.value[index].preview = e.target.result;
            files.value[index].file = file;
            // Emit the files array to the parent component
            emit('update-files', files.value);
            // Automatically add a new upload box when a file is selected
            addNewUploadBox();
        };
        reader.readAsDataURL(file);
    }
};

// Add a new upload box if the previous one is filled
const addNewUploadBox = () => {
    if (files.value[files.value.length - 1].file) {
        files.value.push({ preview: null, file: null });
    }
};

// Choose another file for the current upload box
const chooseAnotherFile = (index) => {
    const fileInput = document.getElementById(`file-input-${index}`);
    fileInput.click(); // Trigger file dialog
};

// Remove the selected file and its preview
const removeFile = (index) => {
    files.value[index] = { preview: null, file: null };
    emit('update-files', files.value);

    // If there's more than one box and no file, remove the box
    if (files.value.length > 1 && !files.value[index].file) {
        files.value.splice(index, 1);
    }
};

// Emit updated files on mount
emit('update-files', files.value);

onMounted(() => {
    ensureEmptyUploadBox();
});
</script>

<style scoped>
#upload-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.upload-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.upload-box {
    width: 200px;
    height: 150px;
    border: 2px dashed #ccc;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    overflow: hidden;
    position: relative;
}

.upload-button {
    width: 50px;
    height: 50px;
    background-color: #4CAF50;
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 24px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
}

.upload-button:hover {
    background-color: #45a049;
}

.file-input {
    display: none;
}

.preview-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
}

.actions {
    display: flex;
    gap: 10px;
}

.actions button {
    border: none;
    color: white;
    padding: 8px;
    border-radius: 5px;
    cursor: pointer;
}

.actions .edit-btn:hover {
    background-color: #0056b3;
}

.actions .edit-btn {
    background-color: #007bff;
}

.actions .delete-btn {
    background-color: #ff0000;
}

.actions .delete-btn:hover {
    background-color: #b40000;
}
</style>
