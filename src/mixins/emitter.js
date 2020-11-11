/*
 * broadcast 事件广播
 * @param {componentName} 组件名称
 * @param {eventName} 事件名
 * @param {params} 参数
 * 遍历寻找所有子孙组件，假如子孙组件和componentName组件名称相同的话，则触发$emit的事件方法，数据为 params.
 * 如果没有找到 则使用递归的方式 继续查找孙组件，直到找到为止，否则继续递归查找，直到找到最后一个都没有找到为止。 
 */
function broadcast(componentName, eventName, params) {
    this.$children.forEach(child => {
        var name = child.$options.name;

        if (name === componentName) {
            child.$emit.apply(child, [eventName].concat(params));
        } else {
            broadcast.apply(child, [componentName, eventName].concat([params]));
        }
    });
}

/* 
 * dispatch 查找所有父级，直到找到要找到的父组件，并在身上触发指定的事件。
 * @param { componentName } 组件名称
 * @param { eventName } 事件名
 * @param { params } 参数
 */
function dispatch(componentName, eventName, params) {
    var parent = this.$parent || this.$root;
    var name = parent.$options.name;

    while (parent && (!name || name !== componentName)) {
        parent = parent.$parent;

        if (parent) {
            name = parent.$options.name;
        }
    }
    if (parent) {
        parent.$emit.apply(parent, [eventName].concat(params));
    }
}

export default {
    methods: {
        $$dispatch(componentName, eventName, params) {
           dispatch.call(this, componentName, eventName, params)
        },
        $$broadcast(componentName, eventName, params) {
            broadcast.call(this, componentName, eventName, params);
        }
    }
};
