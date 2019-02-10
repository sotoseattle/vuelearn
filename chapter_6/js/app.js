Vue.component("breadcrumb", {
  template: `
  <div class="container">
    <span v-for="x in throwCrumbs">
    > <a :href="x.path">{{x.name || 'Home'}}</a>
    </span>
    <hr>
  </div>
  `,
  computed: {
    throwCrumbs() {
      let out = [];
      let str = "";
      parts = this.$store.state.path.split('/');
      for (let x of parts) {
        str += x;
        out.push({
          name: x || 'home',
          path: '#' + str
        });
        str += "/";
      }
      return out;
    }
  }
});

Vue.component("folder", {
  template: `
  <a :href="\'#\' + f.path_lower" class='button'>
    {{ f.name }}
  </a>
  `,
  props: {
    f: Object
  }
});

Vue.component("file", {
  template: `
    <div>
      <strong>{{ f.name }}</strong>
      <span v-if="f.size"> - [{{ formatFileSize(f.size) }}]</span>
      <span v-if="link"> - <a :href="link">Download</a></span>
    </div>`,
  data() {
    return {
      byteSizes: ["bytes", "KB", "MB", "GB", "TB"],
      link: false
    };
  },
  props: {
    f: Object,
    d: Object
  },
  methods: {
    formatFileSize(bytes) {
      let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
      let n = Math.round(bytes / Math.pow(1024, i), 2);
      return n + " " + this.byteSizes[i];
    }
  },
  created() {
    this.d.filesGetTemporaryLink({
        path: this.f.path_lower
      })
      .then(data => {
        this.link = data.link;
      })
  }
});

Vue.component("dropbox-viewer", {
  template: "#dropbox-viewer-template",
  data() {
    return {
      accessToken: config.token,
      structure: {},
      isLoading: true
    };
  },
  computed: {
    path() {
      return this.$store.state.path;
    }
  },
  methods: {
    dropbox() {
      return new Dropbox.Dropbox({
        accessToken: this.accessToken
      });
    },
    getFolderStructure() {
      this.dropbox().filesListFolder({
          path: this.path,
          include_media_info: true
        })
        .then(response => {
          const structure = {
            files: [],
            folders: []
          };
          for (let entry of response.entries) {
            if (entry[".tag"] === "folder") {
              structure.folders.push(entry);
            } else {
              structure.files.push(entry);
            }
          }
          this.structure = structure;
          this.isLoading = false;
        })
        .catch(error => {
          this.isLoading = 'error';
          console.log(error);
        });
    },
    updateStructure() {
      this.isLoading = true;
      this.getFolderStructure();
    }
  },
  created() {
    this.getFolderStructure();
  },
  watch: {
    path() {
      this.updateStructure(this.p);
    }
  }
});

const store = new Vuex.Store({
  state: {
    path: ''
  },
  getters: {},
  mutations: {
    updateHash(state) {
      let hash = window.location.hash.substring(1);
      state.path = (hash || '');
    }
  }
});

const app = new Vue({
  el: "#app",
  store,
  created() {
    store.commit('updateHash');
  }
});

window.onhashchange = () => {
  app.$store.commit('updateHash');
}