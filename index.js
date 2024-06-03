const { createApp } = Vue;

createApp({
    data() {
        return {
            champions: [],
            loading: true,
            searchText: '',
            nextPage: 1,
            isFiltering: false, // Adicionando uma flag para indicar se está filtrando
            showAllSkins: false // Adicionando uma flag para mostrar todas as skins
            };
        },
        computed: {
            filteredChampions() {
                return this.champions.filter(champion =>
                    champion.name.toLowerCase().includes(this.searchText.toLowerCase())
                );
            }
        },
        watch: {
            showAllSkins(newValue) {
                if (newValue) {
                    this.fetchSkinsForChampions();
                }
            }
        },
        created() {
            this.fetchChampions();
            window.addEventListener('scroll', this.handleScroll);
        },
        beforeUnmount() {
            window.removeEventListener('scroll', this.handleScroll);
        },
        methods: {
            async fetchChampions() {
                try {
                    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/14.11.1/data/en_US/champion.json`);
                    const data = await response.json();
                    const champions = Object.values(data.data);
                    this.champions = champions.map(champion => ({
                        id: champion.id,
                        name: champion.name,
                        tags: champion.tags.map(tag => tag.toLowerCase()),
                        info: champion.info.difficulty,
                        image: `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg`,
                        mainTag: champion.tags[0].toLowerCase(),
                        skins: [] // Inicializa a lista de skins vazia
                    }));

                    this.loading = false;

                } catch (error) {
                        console.error(error);
                    }
            },
            async fetchSkinsForChampions() {
                try {
                    for (const champion of this.champions) {
                        const response = await fetch(`http://ddragon.leagueoflegends.com/cdn/14.11.1/data/en_US/champion/${champion.id}.json`);
                        const data = await response.json();
                        const skins = data.data[champion.id].skins;
                        champion.skins = skins.map(skin => ({
                            id: skin.id,
                            name: skin.name === 'default' ? `${champion.name}` : skin.name, // Renomear skin básica
                            image: `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_${skin.num}.jpg`
                        }));
                    }
                } catch (error) {
                    console.error(error);
                    }
            },
            getTypeClass(tag) {
                const typeClassMap = {
                    fighter: 'fighter',
                    tank: 'tank',
                    mage: 'mage',
                    assassin: 'assassin',
                    support: 'support',
                    marksman: 'marksman'
                };

                    return typeClassMap[tag] || '';

            },
            handleScroll() {
                if (this.showAllSkins) return; // Se estiver mostrando todas as skins, não carregue mais campeões ao rolar
                    const bottomOfPage = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight;
                    if (bottomOfPage && !this.loading && !this.isFiltering) { // Verifica se não está filtrando
                        this.loading = true;
                        this.fetchChampions();
                    }
            },
            async buscarClasse(classe) {
                try {
                    this.loading = true;
                    const response = await fetch('https://ddragon.leagueoflegends.com/cdn/14.11.1/data/en_US/champion.json');
                    const data = await response.json();
                    const championsData = Object.values(data.data);

                    if (classe === 'All') {
                        this.champions = championsData.map(champion => ({
                            id: champion.id,
                            name: champion.name,
                            tags: champion.tags,
                            info: champion.info.difficulty,
                            image: `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg`,
                            mainTag: champion.tags[0].toLowerCase(),
                               skins: []
                        }));
                    } else {
                        const championsDaClasse = championsData.filter(champion => champion.tags.includes(classe));
                        this.champions = championsDaClasse.map(champion => ({
                            id: champion.id,
                            name: champion.name,
                            tags: champion.tags,
                            info: champion.info.difficulty,
                            image: `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg`,
                            mainTag: champion.tags[0].toLowerCase(),
                            skins: []
                        }));
                    }

                    if (this.showAllSkins) {
                        await this.fetchSkinsForChampions();
                    }

                    this.loading = false;
                    this.isFiltering = classe !== 'All'; // Define a flag de filtragem com base no parâmetro 'classe'
                } catch (error) {
                    console.error(error);
                    this.loading = false;
                    this.isFiltering = false;
                }
        }
    }
}).mount("#app");;