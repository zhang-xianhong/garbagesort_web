import request from '@/network/request'

// 分页查询
export function listImageForPage(query) {
  return request({
    url: '/recognition/image/listImageForPage',
    method: 'get',
    params: query
  })
}
