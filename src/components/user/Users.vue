<!--  -->
<template>
  <div class>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input
            clearable
            @clear="getUserList"
            placeholder="请输入内容"
            class="input-with-select"
            v-model="queryInfo.query"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" class="state">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <!-- 修改 -->
            <el-button
              @click="showEditDialog(scope.row.id)"
              type="primary"
              icon="el-icon-edit"
              circle
              size="mini"
            ></el-button>
            <!-- 删除 -->
            <el-button
              @click="removeUserById(scope.row.id)"
              type="danger"
              icon="el-icon-delete"
              circle
              size="mini"
            ></el-button>
            <!-- 分配角色 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                circle
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog @close="addDialogClosed" title="添加用户" :visible.sync="addDialogVisible" width="50%">
      <!-- 内容主题区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog @close="editDialogClosed" title="修改用户" :visible.sync="editDialogVisible" width="50%">
      <!-- 主体 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input disabled v-model="editForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <!-- 主体 -->
      <div>
        <p>当前的用户： {{userInfo.username}}</p>
        <p>当前的角色： {{userInfo.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>

export default {
//import引入的组件需要注入到对象中才能使用
components: {},
data() {
  // 验证邮箱的规则
   var checkEmail = (rule, value, callback) => {
     const regEmail = /^\w+@\w+(\.\w+)+$/
     if(regEmail.test(value)) {
       return callback()
     }
     callback(new Error('您输入的邮箱不合法'))
   }

   // 验证手机号的规则
   var checkMobile = (rule, value, callback) => {
     const regMobile = /^1[34578]\d{9}$/
     if(regMobile.test(value)) {
       return callback()
     }
     callback(new Error('您输入的手机号不合法'))
   }
//这里存放数据
return {
    queryInfo : {
        query :'',
        pagenum : 1,
        pagesize : 2
    },
    userList : [],
    total : 0,
    // 控制添加用户对话框的显示与隐藏
    addDialogVisible : false,
    // 控制修改用户对话框的显示与隐藏
    editDialogVisible : false,
    // 添加用户的表单数据
    addForm : {
      username : '',
      password : '',
      email : '',
      mobile : ''
    },
    // 添加表单的验证规则对象
    addFormRules : {
      username:[
        {required:true,message:'请输入用户名',trigger:'blur'},
        {min:3,max:10,message:'用户名长度在3~10个字符之间',trigger:'blur'}
      ],
      password:[
        {required:true,message:'请输入密码',trigger:'blur'},
        {min:6,max:15,message:'用户名长度在6~15个字符之间',trigger:'blur'}
      ],
      email:[
        {required:true,message:'请输入邮箱',trigger:'blur'},
        {validator:checkEmail,trigger:'blur'}
      ],
      mobile:[
        {required:true,message:'请输入手机',trigger:'blur'},
        {validator:checkMobile,trigger:'blur'}
      ]
    },
    // 修改表单的验证规则对象
    editFormRules : {
      email:[
        {required:true,message:'请输入邮箱',trigger:'blur'},
        {validator:checkEmail,trigger:'blur'}
      ],
      mobile:[
        {required:true,message:'请输入手机',trigger:'blur'},
        {validator:checkMobile,trigger:'blur'}
      ]
    },
    // 查询到的用户信息对象
    editForm : {},
    // 控制分配角色的对话框的显示与隐藏
    setRoleDialogVisible : false,
    // 需要被分配角色的用户信息
    userInfo : {},
    // 所有角色的数据列表
    rolesList: [],
    // 已选中的角色Id值
    selectedRoleId: ''
};
},
//监听属性 类似于data概念
computed: {},
//监控data中的数据变化
watch: {},
//方法集合
methods: {
    async getUserList(){
      const {data:res} = await this.$http.get('users',{params:this.queryInfo})
      console.log(res);
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 每页显示条数
    handleSizeChange(val) {
      // console.log(val);
      this.queryInfo.pagesize = val
      this.getUserList()
    },
    // 当前页码
    handleCurrentChange(val) {
      // console.log(val);
      this.queryInfo.pagenum = val
      this.getUserList()
    },
    // 监听switch开关状态的改变
    async userStateChanged(userinfo) {
      console.log(userinfo);
      const {data:res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      
      if(res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加用户
    addUser() {
      this.$refs.addFormRef.validate(async valid=>{
        if(!valid) return
        // 可以发起添加用户的请求
        const{ data:res } = await this.$http.post('users',this.addForm)
        console.log(res)
        if(res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('用户添加成功')
        this.addDialogVisible = false
        this.getUserList()
      })
      
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      // console.log(id)
      const { data:res } = await this.$http.get(`users/${id}`)
      if(res.meta.status !== 200){
        return this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return
         const { data:res } = await this.$http.put(`users/${this.editForm.id}`,{
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if(res.meta.status !== 200) {
          return this.$message.error('修改用户信息失败')
        }
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getUserList()
        // 提示修改成功
        this.$message.success('修改用户信息成功')
      })
    },
    // 根据id删除用户信息
    async removeUserById(id) {
      // 弹框询问
      const confirmRes = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          // confirm
          confirmButtonText: '确定',
          // cancel
          cancelButtonText: '取消',
          type: 'warning'
      }).catch(err => err)
      console.log(confirmRes)
      if(confirmRes !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      const { data:res } = await this.$http.delete(`users/${id}`)
      if(res.meta.status !== 200) {
          return this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      this.getUserList()
    },
    // 展示分配角色的对话框
    async setRole(userInfo) {
      this.userInfo = userInfo

      // 获取所以角色列表
      const { data:res } = await this.$http.get('roles')
      if(res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    // 点击按钮,分配角色
    async saveRoleInfo() {
      if(!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data:res } = await this.$http.put(`users/${this.userInfo.id}/role`,{rid: this.selectedRoleId})
      if(res.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }

      this.$message.success('更新角色成功')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 监听分配角色对话框的关闭事件
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
},
//生命周期 - 创建完成（可以访问当前this实例）
created() {
    this.getUserList()
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
activated() {}, //如果页面有keep-alive缓存功能，这个函数会触发
}
</script>
<style lang='less'>
//@import url(); 引入公共css类
.el-table_1_column_7 .cell {
  display: flex;
  justify-content: space-around;
}
</style>