<template>
  <div id="icon" class="flex" />
</template>

<script lang="ts">
import { defineComponent, onMounted } from '@vue/composition-api';
import jazzicon from '@metamask/jazzicon';

export default defineComponent({
  name: 'Jazzicon',
  props: {
    address: { type: String, required: true },
  },
  setup(props) {
    onMounted(() => {
      const width = 20;
      const identicon = jazzicon(width, parseInt(props.address.slice(2, 10), 16)); // eslint-disable-line
      document.querySelector('#icon')?.appendChild(identicon);
    });
  },
});
</script>
