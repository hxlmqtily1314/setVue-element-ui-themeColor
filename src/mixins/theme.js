export default {
  inject: {
    themeConfig: {
      default: () => ({
        themeColor: '',
        defaultColor: ''
      })
    }
  },
  watch: {
    'themeConfig.themeColor': function(newval,oldval) {
      this.setThemeColor(newval,oldval);
    },
   '$route': function(val,oldval) {
     if(typeof this.themeConfig.themeColor != 'undefined' && this.themeConfig.themeColor !== this.themeConfig.defaultColor) {
       this.$nextTick(() => {
         if(this.themeConfig.themeColor && this.themeConfig.defaultColor) {
           this.setThemeColor(this.themeConfig.themeColor,this.themeConfig.defaultColor)
         }
       })
     }
   }
  },

  methods: {
    // 样式更新
    updateStyle(stylecon,oldCulster,newCluster) {
      let newStyleCon = stylecon;
      oldCulster.forEach((color,index) => {
        if(color.split(',').length > 1) {
          const rgbArr = color.split(',');
          const regexp = new RegExp("\\s*" + rgbArr[0] + "\\s*,\\s*" + rgbArr[1] + "\\s*,\\s*" + rgbArr[2] + "\\s*",'ig');
          newStyleCon = newStyleCon.replace(regexp,newCluster[index])
        } else {
          newStyleCon = newStyleCon.replace(new RegExp(color,'ig'),newCluster[index])
        }

      })
      return newStyleCon;
    },

    // 得到需要修改的一系类颜色值
    getThemeCluster(theme) {
      const clusters = [theme];
      for(let i = 0; i <= 9; i++) {
        clusters.push(this.getTintColor(theme,Number(i / 10).toFixed(2)));
      }
     clusters.push(this.getShadeColor(theme,0.1));
     return clusters;
    },

    // 得到色调颜色
    getTintColor(color,tint) {
      let red = parseInt(color.slice(0,2),16);
      let green = parseInt(color.slice(2,4),16);
      let blue = parseInt(color.slice(4,6),16);

      if(tint == 0) {
        return [red,green,blue].join(',');
      } else {
        red += Math.round((255 - red) * tint);
        green += Math.round((255 - green) * tint);
        blue += Math.round((255 - blue) * tint);
        red = red.toString(16);
        green = green.toString(16);
        blue = blue.toString(16);
        return `#${red}${green}${blue}`
      }
    },

    // 获取阴影色调颜色
    getShadeColor(color,shade) {
      let red = parseInt(color.slice(0,2),16);
      let green = parseInt(color.slice(2,4),16);
      let blue = parseInt(color.slice(4,6),16);

      red = Math.round((1 - shade) * red);
      green = Math.round((1 - shade) * green);
      blue = Math.round((1 - blue) * blue);

      red = red.toString(16);
      green = green.toString(16);
      blue = blue.toString(16);
      return `#${red}${green}${blue}`
    },

    // 修改主题色-head样式以及DOM行内样式
    setThemeColor(newval,oldval) {
      if(typeof newval !== 'string') return;
      const newThemeCluster = this.getThemeCluster(newval.replace('#',''));
      const orignalCluster = this.getThemeCluster(oldval.replace('#',''));
      // 获取原始值中包含rgb格式的值存为数组
      const rgbArr = orignalCluster[1].split(',');
      const orignalRGBRegExp = new RegExp("\\(\\s*" + rgbArr[0] + "\\s*,\\s*" + rgbArr[1] + "\\s*,\\s*" + rgbArr[2] + "\\s*\\)",'i');
      // 获取页面的style标签
      const styles = [].slice.call(document.querySelectorAll('style')).filter((style) => {
        const text = style.innerText;
        return new RegExp(oldval,'i').test(text) || orignalRGBRegExp.test(text);
      })
      styles.forEach((style) => {
        const {innerText} = style;
        if(typeof innerText !== 'string') return;
        style.innerText = this.updateStyle(innerText,orignalCluster,newThemeCluster);
      })

      // 获取DOM元素上的style
      const domAll = [].slice.call(document.getElementsByTagName('*')).filter((dom,index) => {
        const stylCon = dom.getAttribute('style');
        return stylCon && (new RegExp(oldval,'i').test(stylCon) || orignalRGBRegExp.test(stylCon) )
      })
      domAll.forEach((dom) => {
        const styleCon = dom.getAttribute('style');
        dom.style = this.updateStyle(styleCon,orignalCluster,newThemeCluster);
      })
    }
  }
}
