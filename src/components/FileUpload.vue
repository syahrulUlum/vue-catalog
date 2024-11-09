<template>
    <div id="upload-container">
        <div v-for="(file, index) in files" :key="index" class="upload-wrapper">
            <div class="upload-box">
                <input v-bind:id="'file-input-' + index" type="file" class="file-input" accept="image/*"
                    ref="fileInputs" @change="handleFileChange(index)" />
                <label v-if="!file.preview" class="upload-button" :for="'file-input-' + index">
                    +
                </label>
                <img v-if="file.preview" :src="file.preview" class="preview-image" style="display: block;" />
            </div>
            <div v-if="file.preview" class="actions">
                <button @click="chooseAnotherFile(index)">Pilih File Lain</button>
                <button @click="removeFile(index)">Hapus File</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['update-files']);
const files = ref([{ preview: null, file: null }]);

const handleFileChange = (index) => {
    const fileInput = document.getElementById(`file-input-${index}`);
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            files.value[index].preview = e.target.result;
            files.value[index].file = file;
            emit('update-files', files.value);
            addNewUploadBox();
        };
        reader.readAsDataURL(file);
    }
};

const addNewUploadBox = () => {
    if (files.value[files.value.length - 1].file) {
        files.value.push({ preview: null, file: null });
    }
};

const chooseAnotherFile = (index) => {
    const fileInput = document.getElementById(`file-input-${index}`);
    fileInput.click();
};

const removeFile = (index) => {
    files.value[index] = { preview: null, file: null };
    emit('update-files', files.value);

    if (files.value.length > 1 && !files.value[index].file) {
        files.value.splice(index, 1);
    }
};
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
    height: 200px;
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

.upload-button:focus {
    outline: none;
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
    background-color: #007bff;
    border: none;
    color: white;
    padding: 8px;
    border-radius: 5px;
    cursor: pointer;
}

.actions button:hover {
    background-color: #0056b3;
}
</style>