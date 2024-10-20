<template>
  <div>
    <div class="content-container">
        
    </div>
  </div>
</template>

<script lang="ts">
import {
  ipcRenderer, IpcRendererEvent, shell, clipboard, remote,
} from 'electron'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'
import shortid from 'shortid'
import slug from '../../helpers/slug'
import { Site } from '../../store/modules/site'
import { UrlFormats } from '../../helpers/enums'
import { ITag } from '../../interfaces/tag'
import { IPost } from '../../interfaces/post'


export default class Tags extends Vue {
  @State('site') site!: Site;

  postsImageList = []

  
  mounted() {
    console.log(this.site)
    // this.postsImageList = this.site.posts
    this.$watch(
      () => this.site.posts,
      (newPosts) => {
        
      },
    )
  }
}
</script>

<style lang="less" scoped>
.content-container {
  background: transparent;
}

</style>
