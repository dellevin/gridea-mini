import { ipcMain, IpcMainEvent } from 'electron'
import Tags from '../tags'
import Posts from '../posts'
import { IPostDb } from '../interfaces/post'
import { ITag } from '../interfaces/tag'

export default class TagEvents {
  constructor(appInstance: any) {
    const tags = new Tags(appInstance)
    const posts = new Posts(appInstance)

    ipcMain.removeAllListeners('tag-delete')
    ipcMain.removeAllListeners('tag-deleted')
    ipcMain.removeAllListeners('tag-save')
    ipcMain.removeAllListeners('tag-saved')

    ipcMain.removeAllListeners('post-tags-update')// 标签更新
    ipcMain.removeAllListeners('post-tags-updated')

    ipcMain.on('tag-delete', async (event: IpcMainEvent, tagName: string) => {
      const data = await tags.deleteTag(tagName)
      event.sender.send('tag-deleted', data)
    })

    ipcMain.on('tag-save', async (event: IpcMainEvent, tag: ITag) => {
      const data = await tags.saveTag(tag)
      event.sender.send('tag-saved', data)
    })

    ipcMain.on('post-tags-update', async (event:IpcMainEvent, post: IPostDb) => {
      const data = await posts.upadateTags(post)
      event.sender.send('post-tags-updated', data)
    })
  }
}
