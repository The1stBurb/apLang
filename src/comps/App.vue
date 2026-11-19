<script setup>
    import "../main.css";
    import Console from './Console.vue';
    import Input from './Input.vue';

    import { runCode, global } from '../index.js';
</script>

<template>
    <div class="header">
        <button @click = "runCode">Run</button>
    </div>
    <div class="text_box">
        <div id="editor"></div>
        <div id="console">
            <console v-for="line in global.lines" :text="line" />
            <Input />
        </div>
    </div>
</template>