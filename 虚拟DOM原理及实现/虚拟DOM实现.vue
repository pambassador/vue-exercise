<script>
import {setArr} from './utils'
class CreateEl {
    constructor (tagName, props, children) {
        //当只有两个参数的时候，例如celement(el, [123])
        if (Array.isArray(props)) {
            children = props
            props = {}
        }
        //tagNme, props, children数据保存到this对象上
        this.tagName = tagName;
        this.props = props || {};
        this.children = cildren || [];
        this.key = props ? props.key : undefined;
        let count = 0;
        this.children.forEach(child => {
            if(child instanceof CreateEl) {
                count += child.count;
            } else {
                child = '' + child;
            }
            count++
        })
        //给每个节点设置一个count
        this.count = count;
    }
    //构建一个dom树
    render() {
        const el = document.createElement(tis.tagName)
        const props = this.props
        //循环所有属性，然后设置属性
        for (let [key, val] of Object.entries(props)) {
            setAttr(el, key, val)
        }
        this.children.forEach(child => {
            //递归循环 构建tree
            let childEl = (child instanceof CreateEl) ? child.render() : document.createTextNode(child)
            el.appendChild(childEl)
        })
        return el
    }
}


// 用createEL(tagName, props, children)来创建DOM结构，然后渲染到页面上。
const createEl = (tagName, props, children) => new CreateEl(tagName, props, childern)

const vdom = createEL('div', {'id':'box'}, [
    createEl('h1', {style: 'color: pink'}, ['I am H1']),
    createEl('ul', {class: 'list'}, [createEl('li', ['#list1']), createEl('li', ['#list2'])]),
    createEl('p', ['I am p'])
])

const rootnode = vdom.render()
document.body.appendChild(rootnode)

//比较新老DOM树，得到比较的差异对象

import listDiff from 'list-diff2'
// 每个节点有四种变动
export const REPLACE = 0 // 替换原有节点
export const REORDER = 1 // 调整子节点，包括移动、删除等
export const PROPS = 2 // 修改节点属性
export const TEXT = 3 // 修改节点文本内容

export function diff (oldTree, newTree) {
  // 节点的遍历顺序
  let index = 0
  // 在遍历过程中记录节点的差异
  let patches = {}
  // 深度优先遍历两棵树
  deepTraversal(oldTree, newTree, index, patches)
  // 得到的差异对象返回出去
  return patches
}

function deepTraversal(oldNode, newNode, index, patches) {
  let currentPatch = []
  if (newNode === null) { // 如果新节点没有的话直接不用比较了
    return
  }
  if (typeof oldNode === 'string' && typeof newNode === 'string') {
    // 比较文本节点
    if (oldNode !== newNode) {
      currentPatch.push({
        type: TEXT,
        content: newNode
      })
    }
  } else if (oldNode.tagName === newNode.tagName && oldNode.key === newNode.key) {
    // 节点类型相同
    // 比较节点的属性是否相同
    let propasPatches = diffProps(oldNode, newNode)
    if (propasPatches) {
      currentPatch.push({
        type: PROPS,
        props: propsPatches
      })
    }
    // 递归比较子节点是否相同
    diffChildren(oldNode.children, newNode.children, index, patches, currentPatch)
  } else {
    // 节点不一样，直接替换
    currentPatch.push({ type: REPLACE, node: newNode })
  }

  if (currentPatch.length) {
    // 那个index节点的差异记录下来
    patches[index] = currentPatch
  }

}

// 子数的diff
function diffChildren (oldChildren, newChildren, index, patches, currentPatch) {
  var diffs = listDiff(oldChildren, newChildren)
  newChildren = diffs.children
  // 如果调整子节点，包括移动、删除等的话
  if (diffs.moves.length) {
    var reorderPatch = {
      type: REORDER,
      moves: diffs.moves
    }
    currentPatch.push(reorderPatch)
  }

  var leftNode = null
  var currentNodeIndex = index
  oldChildren.forEach((child, i) => {
    var newChild = newChildren[i]
    // index相加
    currentNodeIndex = (leftNode && leftNode.count) ? currentNodeIndex + leftNode.count + 1 : currentNodeIndex + 1
    // 深度遍历，从左树开始
    deepTraversal(child, newChild, currentNodeIndex, patches)
    // 从左树开始
    leftNode = child
  })
}

// 记录属性的差异
function diffProps (oldNode, newNode) {
  let count = 0 // 声明一个有没没有属性变更的标志
  const oldProps = oldNode.props
  const newProps = newNode.props
  const propsPatches = {}

  // 找出不同的属性
  for (let [key, val] of Object.entries(oldProps)) {
    // 新的不等于旧的
    if (newProps[key] !== val) {
      count++
      propsPatches[key] = newProps[key]
    }
  }
  // 找出新增的属性
  for (let [key, val] of Object.entries(newProps)) {
    if (!oldProps.hasOwnProperty(key)) {
      count++
      propsPatches[key] = val
    }
  }
  // 没有新增 也没有不同的属性 直接返回null
  if (count === 0) {
    return null
  }

  return propsPatches
}


//把差异对象应用到渲染的DOM树
import {REPLACE, REORDER, PROPS, TEXT} from './diff'
import {setAttr} from './utils'
export function patch(node, patches) {
    //也是从0开始
    const step = {
        index: 0
    }
    //深度遍历
    deepTraversal(node, step, patches)
}
// 深度优先遍历DOM结构
function deepTraversal(node, step, patches) {
    //拿到当前差异对象
    const currentPatches = patches[step.index]
    const le = node.childNodes ? node.childNodes.length : 0
    for(let i=0; i<len; i++) {
        const child = node.childNodes[i]
        step.index++
        deepTraversal(chid,xstep, patches)
    }
    //如果当前节点存在差异
    if(currentPatches) {
        //把差异对象应用到当前节点上
        applyPatches(node, currentPatches)
    }
}
// 把差异对象应用到当前节点上
function applyPatches(node, currentPatches) {
  currentPatches.forEach(currentPatch => {
    switch (currentPatch.type) {
      // 0: 替换原有节点
      case REPLACE:
        var newNode = (typeof currentPatch.node === 'string') ?  document.createTextNode(currentPatch.node) : currentPatch.node.render()
        node.parentNode.replaceChild(newNode, node)
        break
      // 1: 调整子节点，包括移动、删除等
      case REORDER: 
        moveChildren(node, currentPatch.moves)
        break
      // 2: 修改节点属性
      case PROPS:
        for (let [key, val] of Object.entries(currentPatch.props)) {
          if (val === undefined) {
            node.removeAttribute(key)
          } else {
            setAttr(node, key, val)
          }
        }
        break;
      // 3：修改节点文本内容
      case TEXT:
        if (node.textContent) {
          node.textContent = currentPatch.content
        } else {
          node.nodeValue = currentPatch.content
        }
        break;
      default: 
        throw new Error('Unknow patch type ' + currentPatch.type);
    }
  })
}

// 调整子节点，包括移动、删除等
function moveChildren (node, moves) {
  let staticNodelist = Array.from(node.childNodes)
  const maps = {}
  staticNodelist.forEach(node => {
    if (node.nodeType === 1) {
      const key = node.getAttribute('key')
      if (key) {
        maps[key] = node
      }
    }
  })
  moves.forEach(move => {
    const index = move.index
    if (move.type === 0) { // 变动类型为删除的节点
      if (staticNodeList[index] === node.childNodes[index]) {
        node.removeChild(node.childNodes[index]);
      }
      staticNodeList.splice(index, 1);
    } else {
      let insertNode = maps[move.item.key] 
          ? maps[move.item.key] : (typeof move.item === 'object') 
          ? move.item.render() : document.createTextNode(move.item)
      staticNodelist.splice(index, 0, insertNode);
      node.insertBefore(insertNode, node.childNodes[index] || null)
    }
  })
}
</script>