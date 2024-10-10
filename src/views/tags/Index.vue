<template>
  <div class="">
    
    <a-row type="flex" justify="end" class="tool-container">
      <a-input-search
          class="search-input"
          placeholder="搜索标签"
          style="width: 200px"
          @search="onSearch"
          v-model="keyword"
          @blur="handleSearchInputBlur"
          v-if="searchInputVisible"
        />
      <a-tooltip placement="bottom" title="搜索标签">
          <div class="op-btn" @click="searchInputVisible = true" v-if="!keyword && !searchInputVisible">
            <i class="zwicon-search"></i>
          </div>
      </a-tooltip>
      <a-tooltip placement="bottom" :title="$t('newTag')">
        <div class="op-btn" tabindex="0" @click="newTag">
          <i class="zwicon-plus"></i>
        </div>
      </a-tooltip>
    </a-row>

    <div class="content-container">
      <div
        v-for="(tag, index) in siteTags"
        :key="tag.name"
        class="tag-wrapper"
      >
        <div class="tag" @click="isTagUse(tag, index)">
          <i class="zwicon-price-tag text-base mr-1"></i> {{ tag.name }}
        </div>
        <i
          class="zwicon-trash delete-icon"
          v-if="!tag.used"
          @click="handleDelete(tag.name)"
        ></i>
      </div>
    </div>

    <a-drawer
      :title="$t('tag')"
      width="400"
      :visible="visible"
      @close="close"
      :wrapStyle="{
        height: 'calc(100% - 108px)',
        overflow: 'auto',
        paddingBottom: '108px'
      }"
    >
      <a-form :form="form" layout="vertical">
        <a-form-item :label="$t('tagName')">
          <a-input v-model="form.name" @input="handleNameChange" />
        </a-form-item>
        <a-form-item label="标签 URL">
          <a-input v-model="form.slug" @input="handleSlugChange" />
        </a-form-item>
      </a-form>
      <div
        :style="{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '100%',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'right'
        }"
      >
        <a-button :style="{ marginRight: '8px' }" @click="close">
          {{ $t("cancel") }}
        </a-button>
        <a-button type="primary" :disabled="!canSubmit" @click="saveTag">{{
          $t("save")
        }}</a-button>
      </div>
    </a-drawer>
    <!-- 操作标签 -->
    <a-drawer
      :title="$t('tag')"
      width="400"
      :visible="visibleTAG"
      @close="close"
      :wrapStyle="{
        height: 'calc(100% - 108px)',
        overflow: 'auto',
        paddingBottom: '108px'
      }"
    >
      <div
        v-for="(item, index) in haveTagsPosts"
        :key="index"
        class="post-wrapper"
      >
        <div class="post-content">
          <div class="post-item">
            <div class="label">文章名称：</div>
            <div class="value">{{ item.data.title }}</div>
          </div>

          <div class="post-item">
            <div class="label">标签名称：</div>
            <div class="value">
              <a-select
                mode="tags"
                style="width: 100%"
                v-model="item.data.tags"
                :disabled="item.isEditing"
              >
                <a-select-option
                  v-for="tag in tags"
                  :key="tag"
                  :value="tag"
                  >{{ tag }}</a-select-option
                >
              </a-select>
            </div>
          </div>

          <div class="post-item">
            
            <a-button class="preview-btn" block @click="clickTitleName(item)">
              <i class="zwicon-eye"></i>
              查看文章
            </a-button>
            <a-button class="preview-btn" block @click="editTagByTags(index)" v-if="item.isEditing">
              <i class="zwicon-edit-circle"></i>
              编辑标签
            </a-button>
            <a-button class="preview-btn" block @click="saveTagByTags(item, index)" v-else>
              <i class="zwicon-checkmark"></i>
              保存标签
            </a-button>
          </div>

        </div>
      </div>


    </a-drawer>


    <fade-transition :duration="100">
      <article-update
        v-if="articleUpdateVisible"
        :visible="articleUpdateVisible"
        :articleFileName="currentArticleFileName"
        @close="closeArticle"
        @fetchData="$bus.$emit('site-reload')"
      ></article-update>
    </fade-transition>
  </div>
</template>

<script lang="ts">
import {
  ipcRenderer, IpcRendererEvent, shell, clipboard, remote,
} from 'electron'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'
import shortid from 'shortid'
import { FadeTransition } from 'vue2-transitions'
import slug from '../../helpers/slug'
import { Site } from '../../store/modules/site'
import { UrlFormats } from '../../helpers/enums'
import { ITag } from '../../interfaces/tag'
import ArticleUpdate from './ArticleUpdate.vue'
import { IPost } from '../../interfaces/post'

interface SiteTag {
  name: string
  used: boolean
  slug?: string
  index?: number
}

@Component({
  components: {
    ArticleUpdate,
    FadeTransition,
  },
})
export default class Tags extends Vue {
  @State('site') site!: Site;

  siteTags: SiteTag[] = [];

  searchInputVisible = false

  keyword = ''

  articleUpdateVisible = false

  currentArticleFileName = ''

  haveTagsPosts: any[] = [];

  visibleTAG = false;

  visible = false;

  isUpdate = false;

  form = {
    name: null,
    slug: '',
    index: -1,
  };

  slugChanged = false;
  
  mounted() {
    this.siteTags = this.site.tags;
    this.$watch(
      () => this.site.tags,
      (newTags) => {
        this.siteTags = newTags;
      }
    );
  }

  get canSubmit() {
    return this.form.name
  }

  onSearch(val: string) {
    this.keyword = val
  }

  handleSearchInputBlur() {
    if (!this.keyword) {
      this.searchInputVisible = false
    }
  }

  handleNameChange(val: string) {
    if (
      !this.slugChanged
      && this.site.themeConfig.tagUrlFormat === UrlFormats.Slug
    ) {
      this.form.slug = slug(this.form.name)
    }
  }

  handleSlugChange(val: string) {
    this.slugChanged = !!val
  }

  close() {
    this.visible = false
    // 标签编辑
    this.visibleTAG = false
  }

  newTag() {
    this.form.name = null
    this.form.index = -1
    this.form.slug = ''
    this.visible = true
    this.isUpdate = false
    if (this.site.themeConfig.tagUrlFormat === UrlFormats.ShortId) {
      this.form.slug = shortid.generate()
    }
  }

  buildSlug() {
    if (this.form.slug === '') {
      if (this.site.themeConfig.tagUrlFormat === UrlFormats.Slug) {
        this.form.slug = slug(this.form.name)
      }
      if (this.site.themeConfig.tagUrlFormat === UrlFormats.ShortId) {
        this.form.slug = shortid.generate()
      }
    }
  }

  tagUsed = ''

  isTagUse(tag: any, index: number) {
    // console.log(tag)
    this.tagUsed = ''
    if (tag.used) {
      this.tagUsed = tag.name
      this.updateTagList()
      this.visibleTAG = true
      return
    }
    this.updateTag(tag, index)
  }

  clickTitleName(post: IPost) {
    this.articleUpdateVisible = true
    this.currentArticleFileName = post.fileName
  }

  closeArticle() {
    this.articleUpdateVisible = false
    this.currentArticleFileName = ''
    this.updateTagList()
  }

  editTagByTags(index: number) {
    this.$set(this.haveTagsPosts[index], 'isEditing', false)
  }

  saveTagByTags(post:IPost, index: any) {
    // const updatedTags = post.data.tags
    this.savePostTags(post)
    this.$set(this.haveTagsPosts[index], 'isEditing', true)
  }

  savePostTags(post: IPost) {
    // 将更新后的标签通过 IPC 通信或 API 发送到后端
    // console.log(post)
    ipcRenderer.send('post-tags-update', post)
    // 监听后端保存成功的事件
    ipcRenderer.once('post-tags-updated', (event, result) => {
      // console.log(result)
      if(result){
        this.$message.success('标签已更新')
      }else{
        this.$message.warning('标签更新失败')
      }
      this.$bus.$emit('site-reload')
    })
  }

  get tags() {
    return this.site.tags.map((tag: any) => tag.name)
  }

  // 更新tag列表
  updateTagList() {
    this.haveTagsPosts = []
    const postsCopy = JSON.parse(JSON.stringify(this.site.posts)) // 深拷贝
    postsCopy.forEach((post: any) => {
      if (post.data.tags && post.data.tags.includes(this.tagUsed)) {
        this.$set(post, 'isEditing', true)
        this.haveTagsPosts.push(post)
      }
    })
    this.$bus.$emit('site-reload')
  }


  updateTag(tag: any, index: number) {
    // console.log(tag)
    this.visible = true
    this.isUpdate = true
    this.form.name = tag.name
    this.form.slug = tag.slug
    this.form.index = index
  }

  /**
   * 检查标签合法性
   * 若是新增，则 slug 和 name 都不允许和已有的重复
   * 若是编辑，则 slug 和 name 都不允许和已有的其他标签重复
   */
  checkTagValid() {
    const siteTags = this.site.tags

    const tags = JSON.parse(JSON.stringify(siteTags))
    if (this.isUpdate) {
      tags.splice(this.form.index, 1)
    }

    const foundTagIndex = tags.findIndex(
      (tag: ITag) => tag.name === this.form.name || tag.slug === this.form.slug,
    )
    if (foundTagIndex !== -1) {
      return false
    }

    return true
  }

  saveTag() {
    this.buildSlug()

    const valid = this.checkTagValid()
    if (!valid) {
      this.$message.error('标签的名称或 URL 与其他标签重复')
      return
    }

    ipcRenderer.send('tag-save', { ...this.form, used: false })
    ipcRenderer.once('tag-saved', (event: IpcRendererEvent, result: any) => {
      this.$bus.$emit('site-reload')
      this.$message.success('标签已保存')
      this.visible = false
    })
  }

  async handleDelete(tagValue: string) {
    this.$confirm({
      title: `${this.$t('warning')}`,
      content: `${this.$t('deleteWarning')}`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        ipcRenderer.send('tag-delete', tagValue)
        ipcRenderer.once(
          'tag-deleted',
          (event: IpcRendererEvent, result: any) => {
            this.$bus.$emit('site-reload')
            this.$message.success('标签已删除')
            this.visible = false
          },
        )
      },
    })
  }

  @Watch('keyword')
  handleKeywordChange(val: string) {
    // console.log(this.siteTags)
    if (val) {
      // 使用 filter 过滤出包含 val 的标签
      this.siteTags = this.site.tags.filter((tag: any) => tag.name.includes(val))
      return
    }
    this.siteTags = this.site.tags
  }
}
</script>

<style lang="less" scoped>
.content-container {
  background: transparent;
}

.tag-wrapper {
  display: inline-flex;
  margin-right: 24px;
  margin-bottom: 16px;
  align-items: center;
  border: 1px solid #e8e8e8;
  border-radius: 20px;
  transition: all 0.3s;
  &:hover {
    // box-shadow: 0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -1px rgba(0,0,0,.06)!important;
    @apply shadow-lg;
  }
  .tag {
    font-size: 12px;
    margin-right: 0px;
    border-radius: 0;
    padding: 6px 16px 6px 12px;
    cursor: default;
    &:not(:last-child) {
      cursor: pointer;
      border-right: 1px solid #e8e8e8;
    }
  }
}
.delete-icon {
  padding: 4px 8px;
  &:hover {
    color: #fa5252;
    cursor: pointer;
  }
}


.post-wrapper {
  padding: 16px;
  margin-bottom: 35px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background-color: #fafafa;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.post-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;

  .label {
    font-weight: 500;
    font-size: 14px;
    color: #333;
  }

  .value {
    font-size: 14px;
    color: #666;
    width: 70%;
  }
}
.preview-btn {
  width: 40%;
  border-radius: 20px;
  background: #fff;
  transition: all 0.3s;
  &:hover {
    background: #fafafa;
  }
}
</style>
