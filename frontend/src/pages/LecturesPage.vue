<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import ListElement from '../components/ListElement.vue';
import summaryIcon from '../assets/wand.svg';
import plusIcon from '../assets/plus.svg';
import AddItemButton from "../components/AddItemButton.vue";

interface SummarizedLecture {
  summary: {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  };
}

const classes = ref([
  {
    title: "Lorem Ipsum.json (100 pages)",
    date: "13/11/2025"
  },
  {
    title: "Lorem Ipsum.json (100 pages)",
    date: "13/11/2025"
  },
  {
    title: "Lorem Ipsum.json (100 pages)",
    date: "13/11/2025"
  },
  {
    title: "Lorem Ipsum.json (100 pages)",
    date: "13/11/2025"
  }
]);

const handleSummary = async (text: string) => {
  try {
    const response = await axios.post('/api/summarize', { text });
    const summarizedText: SummarizedLecture = response.data;
    const content = summarizedText?.summary?.choices?.[0]?.message?.content;
    if (content) {
      console.log('Generated summary:', content);
    }
  } catch (error) {
    console.error('Error generating summary:', error);
  }
};

</script>
<template>
  <div
    class="h-full flex-1 w-full relative bg-white overflow-hidden shrink-0 text-left text-[1rem] text-darkslateblue font-inter">
    <div
      class="absolute top-[calc(50%_-_147px)] left-[calc(50%_-_250px)] w-[31.25rem] overflow-hidden flex flex-col items-center p-[0.312rem] box-border gap-[0.625rem]">
      <div class="self-stretch flex items-center gap-[0.625rem] text-[1.875rem] text-darkslategray">
        <div class="relative font-semibold">Lorem Lectures - Class 1</div>
        <AddItemButton :icon="plusIcon" alt="Add Lecture" :onClick="() => {
          // !TODO
        }
          " />
      </div>
      <ListElement v-for="(classItem, index) in classes" :key="index" :title="classItem.title" :date="classItem.date"
        :index="index"
        :buttons="[{ icon: summaryIcon, alt: 'Summary', onClick: () => handleSummary('Internet (raramente adattata in interrete[1]) è unarchitettura di sistema che permette linterconnessione tra diverse reti di computer a livello globale (internetwork).[2] Il termine nasce, nellambito delle comunicazioni radio in tempo di guerra, come abbreviazione di internet traffic, attestato già nel 1945[3]. Nel significato di interconnessione di terminali e computer appartenenti a reti diverse (internetwork, come acronimo di interconnected networks) si trova nellRFC 675, Specification of Internet Transmission Control Protocol, pubblicato nel dicembre 1974.[4] Solo dal 1991, sulla base dello specifico protocollo HTTP, si è cominciato a sviluppare il World Wide Web (WWW), successivamente diventato il protocollo predominante, fino a far confondere, nel linguaggio comune, il termine WWW con il termine internet: per questo sempre più spesso quando si incontra il termine internet su letteratura non specialistica, in realtà si intende il WWW, uno dei maggiori mezzi di comunicazione di massa (assieme a radio e televisione),[5][6][7] grazie allofferta allutente di una vasta serie di contenuti potenzialmente informativi e di servizi. Internet è linterconnessione globale tra reti di telecomunicazioni e informatiche di natura e di estensione diversa, resa possibile da una suite di protocolli di rete comune chiamata TCP/IP dal nome dei due protocolli principali, il TCP e lIP, che costituiscono la lingua comune con cui i computer connessi a Internet (gli host) sono interconnessi e comunicano tra loro a un livello superiore indipendentemente dalla loro sottostante architettura hardware e software, garantendo così linteroperabilità tra sistemi e sottoreti fisiche diverse. Lavvento e la diffusione di Internet e dei suoi servizi hanno rappresentato una vera e propria rivoluzione tecnologica e socio-culturale dagli inizi degli anni novanta (assieme ad altre invenzioni come i telefoni cellulari e il GPS) nonché uno dei motori dello sviluppo economico mondiale nellambito delle Tecnologie dellInformazione e della Comunicazione (ICT). In quanto rete di telecomunicazione, come diffusione è seconda solo alla rete telefonica generale, anchessa di diffusione mondiale e ad accesso pubblico, ma ancora più capillare di Internet.') }]" />
    </div>
  </div>
</template>