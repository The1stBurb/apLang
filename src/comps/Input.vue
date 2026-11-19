<script setup>
    import { ref, defineProps } from 'vue';
    import { global } from '../index.js';
    
    const text = ref('');
    const editorRef = ref(null);
    function handleInput(event){
        text.value = event.target.innerText;
    }
    const handleEnter = () => {
        global.input = text.value;

        text.value = '';
        if (editorRef.value) {
            editorRef.value.innerText = '';
        }
    }
    // watch(text, (newVal) => {
    //     if (editorRef.value && editorRef.value.innerText !== newVal) {
    //         editorRef.value.innerText = newVal
    //     }
    // })
</script>
<template>
    <div style="border: 1px solid #fff;display:block;"
        ref="editorRef"
        contenteditable="true"
        role="textbox"
        aria-multiline="false"
        class="fake-input"
        @input="handleInput"
        @keydown.enter.prevent = "handleEnter"
    ></div>
</template>