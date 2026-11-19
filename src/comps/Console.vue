<script setup>
    import { ref, defineProps } from 'vue';

    const { text, inp } = defineProps({
        text: {type: String, },
        inp: {type: Boolean, },
    });
</script>
<template>
    <div>
        {{ text }}
    </div>
</template>