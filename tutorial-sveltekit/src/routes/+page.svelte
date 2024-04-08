<!-- routes/+page.svelte -->
<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData } from "./$types.js";
  export let data: PageData;
</script>

<p>Logged in as {data.username}</p>
<form method="post" use:enhance>
  <button>Sign out</button>
</form>
