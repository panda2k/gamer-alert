<template>
<div class="row ms-5">
    <div class="p-0 col-xl-4 col-md-12 d-flex flex-column">
        <h2 id="catch-phrase" class="mb-4">Reclaim your time from the rift</h2>
        <h3 id="value-prop" class="mb-3">Gamer Alert bundles all the tools you need for recovery and rehabilitation into one tool.</h3>
        <form v-on:submit.prevent class="w-50">
            <input id="league-name-input" v-model="leagueUsername" class="form-control" type="text" maxlength="16" placeholder="Enter your League username to get started">
        </form>
    </div>
</div>
</template>

<script>
export default {
    name: 'Hook',
    data() {
        return {
            leagueUsername: ''
        }
    },
    mounted: function() {
        //const leagueInput = document.getElementById('league-name-input')
        //leagueInput.setAttribute('size', leagueInput.getAttribute('placeholder').length)
    }
}
</script>

<style scoped>
#catch-phrase {
    font-weight: 600;
}

#league-name-input {
    border-radius: 5px;
}

#value-prop {
    font-weight: 400;
    font-size: 1rem;
}
</style>