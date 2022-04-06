import request from '@/utils/request'

// 分页查询
export function listNoticeForPage(query) {
  return request({
    url: '/notice/listNoticeForPage',
    method: 'get',
    params: query
  })
}
// 添加
export function addNotice(data) {
  return request({
    url: '/notice/addNotice',
    method: 'post',
    params: data
  })
}

// 修改
export function updateNotice(data) {
  return request({
    url: '/notice/updateNotice',
    method: 'put',
    params: data
  })
}
// 删除
export function deleteNoticeByIds(id) {
  return request({
    url: '/notice/deleteNoticeByIds/' + id,
    method: 'delete'
  })
}
// 查询一个
export function getNoticeById(id) {
  return request({
    url: '/notice/getNoticeById/' + id,
    method: 'get'
  })
}

