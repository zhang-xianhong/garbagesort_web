import request from '@/network/request';
// 某一类型的总数
export function getCount() {
  return request({
    url: '/system/fistPageInfo/count',
    method: 'get'
  })
}
// 获取前六的热词
export function hotKeyword() {
  return request({
    url: '/system/fistPageInfo/hotKeyword',
    method: 'get'
  })
}

