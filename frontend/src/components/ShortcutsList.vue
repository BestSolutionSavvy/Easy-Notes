<script setup lang="ts">
interface Shortcut {
  key: string;
  description: string;
}

interface ShortcutSection {
  title?: string;
  shortcuts: Shortcut[];
}

const shortcutSections: ShortcutSection[] = [
  {
    shortcuts: [
      { key: "← →", description: "Naviga pagine" },
      { key: "Enter", description: "Inizia modifica" },
      { key: "Esc", description: "Esci da modifica" },
      { key: "Ctrl + S", description: "Salva note" },
    ],
  },
  {
    title: "Durante la modifica",
    shortcuts: [{ key: "Ctrl + ← →", description: "Naviga scrivendo" }],
  },
  {
    title: "Modalità textbox",
    shortcuts: [{ key: "Click + Drag", description: "Disegna textbox" }],
  },
];
</script>

<template>
  <div
    class="flex flex-col w-[380px] max-h-[480px] overflow-y-auto bg-white rounded-xl shadow-lg"
  >
    <div class="p-4 space-y-4">
      <div
        v-for="(section, index) in shortcutSections"
        :key="index"
        class="space-y-2.5"
      >
        <div
          v-if="section.title"
          class="flex items-center gap-2.5 pt-2 pb-1"
          :class="{ 'border-t border-gray-200': index > 0 }"
        >
          <div
            class="h-px flex-1 bg-gradient-to-r from-orange-300 to-transparent"
          ></div>
          <span class="text-xs font-bold text-gray-700 uppercase tracking-wide">
            {{ section.title }}
          </span>
          <div
            class="h-px flex-1 bg-gradient-to-l from-orange-300 to-transparent"
          ></div>
        </div>

        <div class="space-y-1.5">
          <div
            v-for="(shortcut, sIndex) in section.shortcuts"
            :key="sIndex"
            class="flex items-center justify-between gap-3 py-1.5 px-2.5 rounded-lg hover:bg-orange-50 transition-all group"
          >
            <kbd
              class="inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold text-gray-700 bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-300 rounded-md shadow-sm min-w-[70px] group-hover:border-orange-400 group-hover:shadow-md transition-all"
            >
              {{ shortcut.key }}
            </kbd>
            <span
              class="text-xs text-gray-700 flex-1 text-right leading-relaxed"
            >
              {{ shortcut.description }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #fb923c, #fbbf24);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #f97316, #f59e0b);
}
</style>
