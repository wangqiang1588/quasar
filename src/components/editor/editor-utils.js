import { QBtn, QBtnToggle, QBtnDropdown, QBtnGroup } from '../btn'
import { QTooltip } from '../tooltip'
import { QList, QItem, QItemSide, QItemMain } from '../list'
import extend from '../../utils/extend'

function run (btn, vm) {
  if (btn.handler) {
    btn.handler(vm)
  }
  else {
    vm.runCmd(btn.cmd, btn.param)
  }
}

function getBtn (h, vm, btn) {
  if (btn.type === 'slot') {
    return vm.$slots[btn.slot]
  }

  if (btn.type === 'dropdown') {
    let
      label = btn.label,
      icon = btn.icon

    const Items = btn.options.map(btn => {
      const disable = btn.disable ? btn.disable(vm) : false
      const active = btn.type === void 0
        ? vm.caret.is(btn.cmd, btn.param)
        : false

      if (active) {
        label = btn.tip
        icon = btn.icon
      }

      return h(
        QItem,
        {
          props: { active, link: !disable },
          staticClass: disable ? 'disabled' : '',
          on: {
            click () {
              if (disable) { return }
              instance.componentInstance.close()
              vm.$refs.content.focus()
              vm.caret.restore()
              run(btn, vm)
            }
          }
        },
        [
          h(QItemSide, {props: {icon: btn.icon}}),
          h(QItemMain, {
            props: {
              label: btn.tip
            }
          })
        ]
      )
    })

    const instance = h(
      QBtnDropdown,
      {
        props: extend({
          noCaps: true,
          noWrap: true,
          color: btn.highlight && label !== btn.label ? vm.toggleColor : vm.color,
          label: btn.fixedLabel ? btn.label : label,
          icon: btn.fixedIcon ? btn.icon : icon
        }, vm.buttonProps)
      },
      [ h(QList, { props: { separator: true } }, [ Items ]) ]
    )
    return instance
  }

  const child = []
  if (btn.tip && vm.$q.platform.is.desktop) {
    const Key = btn.key
      ? h('div', [h('small', `(CTRL + ${String.fromCharCode(btn.key)})`)])
      : null
    child.push(h(QTooltip, { props: {delay: 1000} }, [btn.tip, Key]))
  }

  if (btn.type === void 0) {
    return h(QBtnToggle, {
      props: extend({
        icon: btn.icon,
        label: btn.label,
        toggled: vm.caret.is(btn.cmd, btn.param),
        color: vm.color,
        toggleColor: vm.toggleColor,
        disable: btn.disable ? btn.disable(vm) : false
      }, vm.buttonProps),
      on: {
        click () {
          run(btn, vm)
        }
      }
    }, child)
  }
  if (btn.type === 'no-state') {
    return h(QBtn, {
      props: extend({
        icon: btn.icon,
        color: vm.color,
        label: btn.label,
        disable: btn.disable ? btn.disable(vm) : false
      }, vm.buttonProps),
      on: {
        click () {
          run(btn, vm)
        }
      }
    }, child)
  }
}

export function getToolbar (h, vm) {
  if (vm.caret) {
    return vm.buttons.map(group => h(
      QBtnGroup,
      { props: vm.buttonProps, staticClass: 'relative-position' },
      group.map(btn => getBtn(h, vm, btn))
    ))
  }
}
