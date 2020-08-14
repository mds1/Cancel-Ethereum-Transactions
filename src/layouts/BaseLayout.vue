<template>
  <q-layout view="hHh Lpr fFf">
    <q-header style="color: #000000; background-color: rgba(0, 0, 0, 0);">
      <q-toolbar>
        <q-toolbar-title class="row justify-start items-center q-my-md">
          <img
            alt="Ethereum logo"
            class="col-auto"
            src="~assets/app-icon.png"
            style="max-width: 50px;"
          />
        </q-toolbar-title>

        <div>
          <div class="row justify-end q-mt-xs">
            <div v-if="userAddress" class="col-xs-12 dark-toggle text-caption text-right">
              {{ userAddress }}
            </div>
            <q-icon
              class="col-auto dark-toggle"
              :name="$q.dark.isActive ? 'brightness_7' : 'bedtime'"
              style="cursor: pointer;"
              @click="toggleDarkMode()"
            />
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer style="color: #000000; background-color: rgba(0, 0, 0, 0);">
      <div class="dark-toggle text-center text-caption q-my-xl">
        Built by
        <a href="https://twitter.com/msolomon44" target="_blank" class="hyperlink">Matt Solomon</a>
      </div>
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, onMounted } from '@vue/composition-api';
import { Dark, LocalStorage } from 'quasar';
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

function useWalletAddress() {
  const { userAddress } = useWalletStore();

  return { userAddress };
}

export default defineComponent({
  name: 'BaseLayout',
  setup() {
    return { ...useDarkMode(), ...useWalletAddress() };
  },
});
</script>
