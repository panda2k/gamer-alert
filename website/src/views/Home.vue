<template>
<div id="home" class="min-vh-100 d-flex-column">
    <div class="pt-3">
        <MenuBar/>
    </div>
    <div class="pt-5 mt-5">
        <Hook/>
    </div>
</div>
</template>

<script>
import MenuBar from '../components/MenuBar.vue'
import Hook from '../components/Hook.vue'

export default {
    name: 'Home',
    components: {
        MenuBar,
        Hook
    }
}
</script>

<style scoped>

</style>
