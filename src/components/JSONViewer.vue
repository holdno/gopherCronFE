<template>
  <pre :innerHTML="safeSyntaxHighlight(props.json)" />
</template>

<script setup lang="ts">
  const props = defineProps({
    json: {
      type: String,
      default: 'none',
    },
  });

  function safeSyntaxHighlight(raw: string): string {
    try {
      return syntaxHighlight(JSON.stringify(JSON.parse(raw), null, 2));
    } catch (e) {
      return raw;
    }
  }

  function syntaxHighlight(json: string): string {
    json = json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\\-]?\d+)?)/g,
      function (match) {
        let cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      },
    );
  }
</script>

<style>
  pre {
    /* outline: 1px solid #ccc; */
    padding: 5px;
    margin: 5px;
  }
  .string {
    color: green;
  }
  .number {
    color: darkorange;
  }
  .boolean {
    color: blue;
  }
  .null {
    color: magenta;
  }
  .key {
    color: red;
  }
</style>
