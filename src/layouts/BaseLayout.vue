<template>
  <q-layout view="hhh Lpr fff" style="z-index: 0;">
    <q-header style="color: #000000; background-color: rgba(0, 0, 0, 0);">
      <q-toolbar class="row justify-between items-center q-my-md">
        <q-toolbar-title class="col">
          <!-- Logo and nav bar -->
          <div class="row justify-start items-center">
            <router-link class="col-auto" tag="div" :to="{ name: 'home' }" style="line-height: 0;">
              <img alt="Ethereum logo" src="~assets/app-icon.png" style="max-width: 50px;" />
            </router-link>

            <router-link
              active-class="is-active"
              class="col-auto cursor-pointer dark-toggle q-ml-lg"
              exact
              tag="div"
              :to="{ name: 'home' }"
            >
              <span style="font-size: 1rem;">Home</span>
            </router-link>

            <router-link
              active-class="is-active"
              class="col-auto cursor-pointer dark-toggle q-ml-lg"
              tag="div"
              :to="{ name: 'help' }"
            >
              <span style="font-size: 1rem;">Help</span>
            </router-link>

            <router-link
              v-if="displayName"
              active-class="is-active"
              class="col-auto cursor-pointer dark-toggle q-ml-lg"
              tag="div"
              :to="{ name: 'cancel' }"
            >
              <span style="font-size: 1rem;">Cancel</span>
            </router-link>

            <router-link
              v-if="displayName"
              active-class="is-active"
              class="col-auto cursor-pointer dark-toggle q-ml-lg"
              tag="div"
              :to="{ name: 'speedUp' }"
            >
              <span style="font-size: 1rem;">Speed Up</span>
            </router-link>
          </div>
        </q-toolbar-title>

        <!-- Login address and settings -->
        <div class="col">
          <div class="row justify-end q-mt-xs">
            <div v-if="displayName" class="col-xs-12 dark-toggle text-right">
              <div class="row justify-end">
                <Jazzicon :address="userAddress" class="q-mr-sm" />
                <span>{{ displayName }}</span>
              </div>
            </div>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer style="color: #000000; background-color: rgba(0, 0, 0, 0);">
      <div class="row justify-between dark-toggle text-caption q-my-xl q-mx-md">
        <div class="col-auto">
          <q-icon
            class="col-auto dark-toggle"
            :name="$q.dark.isActive ? 'fas fa-sun' : 'fas fa-moon'"
            style="cursor: pointer;"
            @click="toggleDarkMode()"
          />
        </div>
        <div class="col-auto">
          Built by
          <a href="https://twitter.com/msolomon44" target="_blank" class="hyperlink">
            Matt Solomon
          </a>
        </div>
        <div class="col-auto">
          <a
            href="https://github.com/mds1/Cancel-Ethereum-Transactions"
            target="_blank"
            class="dark-toggle no-text-decoration"
          >
            <q-icon name="fab fa-github" size="sm" />
          </a>
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, onMounted } from '@vue/composition-api';
import { Dark, LocalStorage } from 'quasar';
import Jazzicon from 'src/components/Jazzicon.vue';
import useWalletStore from 'src/store/wallet';

function useDarkMode() {
  function toggleDarkMode() {
    Dark.set(!Dark.isActive);
    LocalStorage.set('is-dark', Dark.isActive);
  }

  const mounted = onMounted(function () {
    Dark.set(Boolean(LocalStorage.getItem('is-dark')));
  });

  return { toggleDarkMode, mounted };
}

function useDisplayName() {
  const { displayName, userAddress } = useWalletStore();
  return { displayName, userAddress };
}

export default defineComponent({
  name: 'BaseLayout',
  components: { Jazzicon },
  setup() {
    return { ...useDarkMode(), ...useDisplayName() };
  },
});
</script>

<style lang="sass" scoped>
.is-active
  font-weight: bold
</style>
