<template>
    <nav class="navbar navbar-expand-md" id="nav">
        <div id="header" class="ms-5">
            <a class="navbar-brand white-text no-hover" href="/" id="logo-text">GAMER ALERT</a>
            <button class="navbar-toggler custom-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
        </div>

        <div class="collapse navbar-collapse w-100 me-5" id="navbarTogglerDemo02">
          <ul class="navbar-nav mr-auto mt-2 mt-lg-0 flex-row justify-content-end w-100 align-items-center" id="menu-items">
            <li class="nav-item">
                <router-link class="nav-link href-links" to="#features">
                    <span>Features</span>
                </router-link>
            </li>
            <button class="no-border rounded-corner px-5 ms-3" id="login-button"> 
                <li class="nav-item" id="dash-button">
                    <router-link class="nav-link button-text" id="dash-link" to="/login">
                        Login                  
                    </router-link>
                </li>
            </button>
          </ul>
          <router-view/>
        </div>
    </nav>
</template>

<script>
export default {
    name: 'MenuBar'
}
</script>

<style scoped>
.button-text {
    color: white;

}

#logo-text {
    font-family: "Helvetica Neue";
    font-weight: bold;
    font-size: 1.75rem;
}

#login-button {
    background-color: #3994FF;
}

.href-links {
    color: #717375;
}
</style>
