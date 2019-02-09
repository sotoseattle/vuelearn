
Vue.component('dropbox-viewer', {
	template: '#dropbox-viewer-template',
	data() {
		return {
			accessToken: config.token,
			structure: [],
			byteSizes: ['Bytes', 'KB', 'MB', 'GB', 'TB'],
			isLoading: true
		}
	},
	methods: {
		dropbox() {
			return new Dropbox.Dropbox({
				accessToken: this.accessToken
			});
		},
		getFolderStructure(path) {
			this.dropbox().filesListFolder({
				path: path,
				include_media_info: true
			})
			.then(response => {
				console.log(response.entries);
				this.structure = response.entries;
				this.isLoading = false;
			})
			.catch(error => {
				console.log(error);
			})
		},
		formatFileSize(bytes) {
			let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
			let n = Math.round(bytes / Math.pow(1024, i), 2)
			return n + ' ' + this.byteSizes[i];
		}
	},
	created() {
		this.getFolderStructure('/Photos/astronomy');
	}
});

new Vue({
	el: '#app'
});





