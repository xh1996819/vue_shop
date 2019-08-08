<!-- Home.vue 主页 -->
<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse? '64px' : '200px'">
        <div class="toggle-button" v-text="`<>`" @click="toggleCollapse"></div>
        <el-menu
          :default-active="$route.path"
          class="el-menu-vertical-demo"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
        >
          <!-- 一级列表 -->
          <el-submenu :index="item.id + ''" v-for="(item,i) in menuList" :key="item.id">
            <template slot="title">
              <i :class="item.icons[i]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级列表 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      menuList: [],
      isCollapse: false
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    // 获取侧边栏列表数据
    async getMenuList(){
      const {data:res} = await this.$http.get('menus')
      console.log(res);
      const iconArr = ['iconfont icon-users','iconfont icon-tijikongjian','iconfont icon-shangpin','iconfont icon-danju','iconfont icon-baobiao']
      res.data.forEach(item=>{
        item.icons = iconArr
      })
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    // 折叠侧边栏按钮事件
    toggleCollapse(){
      this.isCollapse = !this.isCollapse
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    console.log(this.$route.path);
    this.getMenuList()
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    
    
  },
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {}, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang='less' scoped>
//@import url(); 引入公共css类
.home-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #373d41;
  padding-left: 10px;
  div {
    display: flex;
    height: 100%;
    align-items: center;
    img {
      height: 100%;
    }
    span {
      font-size: 24px;
      color: #fff;
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 21px;
    letter-spacing: .2em;
    color: #fff;
    text-align: center;
    cursor: pointer;
  }
  .toggle-button:hover {
    background-color: #333744;
  }
  .el-menu {
    border-right: 0;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 8px;
}
</style>