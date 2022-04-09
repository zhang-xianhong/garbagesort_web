import request from '@/network/request'

// 分页查询
export function listRoleForPage(query) {
  return request({
    url: '/role/listRoleForPage',
    method: 'get',
    params: query
  })
}
// 添加
export function addRole(data) {
  return request({
    url: '/role/addRole',
    method: 'post',
    params: data
  })
}
// 修改
export function updateRole(data) {
  return request({
    url: '/role/updateRole',
    method: 'put',
    params: data
  })
}
// 删除
export function deleteRoleByIds(id) {
  return request({
    url: '/role/deleteRoleByIds/' + id,
    method: 'delete'
  })
}
// 查询一个
export function getRoleById(id) {
  return request({
    url: '/role/getRoleById/' + id,
    method: 'get'
  })
}
// 保存角色和菜单权限之间的关系
export function saveRoleMenu(roleId, menuIds) {
  // 处理如果没有选择菜单数据。无法匹配后台数据的问题
  if (menuIds.length === 0) {
    menuIds = [-1]
  }
  return request({
    url: '/role/saveRoleMenu/' + roleId + '/' + menuIds,
    method: 'post'
  })
}
// 查询所有可用角色
export function selectAllRole() {
  return request({
    url: '/role/selectAllRole',
    method: 'get'
  })
}
// 根据用户ID查询用户拥有的角色IDS
export function getRoleIdsByUserId(userId) {
  return request({
    url: '/role/getRoleIdsByUserId/' + userId,
    method: 'get'
  })
}

// 保存角色和用户之间的关系
export function saveRoleUser(userId, roleIds) {
  // 处理如果没有选择角色数据。无法匹配后台数据的问题
  if (roleIds.length === 0) {
    roleIds = [-1]
  }
  return request({
    url: '/role/saveRoleUser/' + userId + '/' + roleIds,
    method: 'post'
  })
}
