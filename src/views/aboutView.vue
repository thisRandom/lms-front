<script setup lang="ts">
</script>

<template>
  <div class="about-page">
    <div class="about-card">
      <div class="about-content">
        <a href="/login" class="back-login-btn">
          <a-button type="secondary" size="small">
            <template #icon>←</template>
            返回登录页
          </a-button>
        </a>
        <h1>关于我们</h1>
        <p class="subtitle">物流管理系统</p>

        <div class="section">
          <h2>项目介绍</h2>
          <p>
            物流管理系统（LMS）是一个现代化的物流管理平台，致力于为物流企业提供高效、便捷的车辆调度、订单管理和运输跟踪服务。
          </p>
        </div>

        <div class="section">
          <h2>主要功能</h2>
          <ul>
            <li><strong>用户管理：</strong>支持管理员、调度员、司机和客户四种角色，提供完善的权限控制体系。</li>
            <li><strong>车辆管理：</strong>对运输车辆进行统一管理，实时跟踪车辆状态和位置信息。</li>
            <li><strong>订单管理：</strong>从订单创建到完成的完整生命周期管理，支持多种订单状态流转。</li>
            <li><strong>调度管理：</strong>智能化的调度系统，根据订单需求和车辆状态进行最优匹配。</li>
            <li><strong>位置追踪：</strong>实时获取车辆位置信息，提供运输过程的全程可视化追踪。</li>
          </ul>
        </div>

        <div class="section">
          <h2>技术架构</h2>
          <ul>
            <li><strong>前端技术：</strong>Vue 3 + TypeScript，使用 Arco Design Vue 组件库构建现代化用户界面。</li>
            <li><strong>后端架构：</strong>采用微服务架构设计，各模块独立部署，协同工作。</li>
            <li><strong>数据安全：</strong>所有敏感数据均经过加密处理，保障用户信息和业务数据安全。</li>
          </ul>
        </div>

        <div class="section">
          <h2>联系我们</h2>
          <p>如有任何问题或建议，请联系系统管理员。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.about-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-1);
  padding: 20px;

  .about-card {
    width: 100%;
    max-width: 700px;
    background: rgba(var(--gray-1), 0.9);
    backdrop-filter: blur(16px);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.05);
  }

  .about-content {
    .back-login-btn {
      display: inline-block;
      margin-bottom: 20px;
      text-decoration: none;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--color-text-1);
      margin: 0 0 8px;
    }

    .subtitle {
      color: var(--color-text-3);
      font-size: 14px;
      margin-bottom: 32px;
    }

    .section {
      margin-bottom: 28px;

      h2 {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-text-1);
        margin: 0 0 12px;
        padding-left: 12px;
        border-left: 3px solid var(--color-primary);
      }

      p {
        color: var(--color-text-2);
        line-height: 1.8;
        margin: 0;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          color: var(--color-text-2);
          line-height: 1.8;
          padding: 6px 0;
          padding-left: 20px;
          position: relative;

          &::before {
            content: '•';
            position: absolute;
            left: 6px;
            color: var(--color-primary);
          }
        }
      }
    }
  }
}
</style>