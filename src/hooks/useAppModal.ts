import { useCallback } from 'react';
import { App } from 'antd';
import type { ModalStaticFunctions } from 'antd/es/modal/confirm';
import type { ModalFuncProps } from 'antd/es/modal/interface';

/**
 * ------------------------------------------------------------------
 * useAppModal
 * ------------------------------------------------------------------
 * 基于 antd App.useApp().modal 封装的 Hook，用于在函数组件中以命令式方式调用 Modal。
 *
 * 设计目标：
 * 1. 消除每开一个弹窗就要声明一个 useState 的繁琐。
 * 2. 完整保留 antd Modal 的所有能力（包括 content 里放复杂表单）。
 * 3. 自动继承 ConfigProvider 的主题、国际化、前缀等 Context。
 * 4. 支持 Promise 化调用（await modal.confirm(...)）。
 *
 * 前置条件：
 * - 项目根组件必须被 <App> 包裹（已在 MainLayout 或入口完成）。
 * - 禁止在 React 组件树外调用（如 Redux middleware）。
 *
 * 关于 "content 里放表单" 的说明：
 * - 完全支持！content 可以是任意 ReactNode，包括 <Form>、自定义组件等。
 * - 但需注意：函数式 Modal 的 content 是闭包快照，打开后不会自动响应外部状态变化。
 *   如果表单需要与外部状态实时同步，建议在 content 内部自行管理状态，或使用组件式 <Modal>。
 * ------------------------------------------------------------------
 */

/** 扩展的 Modal 配置，允许传入自定义类型 */
export type AppModalConfig = ModalFuncProps;

export interface UseAppModalReturn {
  /** 打开信息提示弹窗 */
  info: (config: AppModalConfig) => ReturnType<ModalStaticFunctions['info']>;
  /** 打开成功提示弹窗 */
  success: (config: AppModalConfig) => ReturnType<ModalStaticFunctions['success']>;
  /** 打开错误提示弹窗 */
  error: (config: AppModalConfig) => ReturnType<ModalStaticFunctions['error']>;
  /** 打开警告提示弹窗 */
  warning: (config: AppModalConfig) => ReturnType<ModalStaticFunctions['warning']>;
  /** 打开确认弹窗（最常用，支持 await） */
  confirm: (config: AppModalConfig) => ReturnType<ModalStaticFunctions['confirm']>;
  /** 打开弹窗并返回 Promise<boolean>，点击确定 resolve(true)，点击取消 resolve(false) */
  confirmAsync: (config: Omit<AppModalConfig, 'onOk' | 'onCancel'>) => Promise<boolean>;
  /** 打开一个可承载复杂表单/自定义内容的弹窗，自动处理 footer 和状态 */
  openFormModal: (
    config: AppModalConfig & { onSubmit?: () => void | Promise<void> }
  ) => ReturnType<ModalStaticFunctions['confirm']>;
}

export const useAppModal = (): UseAppModalReturn => {
  const { modal } = App.useApp();

  const info = useCallback((config: AppModalConfig) => modal.info(config), [modal]);

  const success = useCallback((config: AppModalConfig) => modal.success(config), [modal]);

  const error = useCallback((config: AppModalConfig) => modal.error(config), [modal]);

  const warning = useCallback((config: AppModalConfig) => modal.warning(config), [modal]);

  const confirm = useCallback((config: AppModalConfig) => modal.confirm(config), [modal]);

  /**
   * confirmAsync - 将确认弹窗 Promise 化
   * 使用场景：顺序逻辑中需要根据用户选择执行不同分支
   *
   * 示例：
   * const confirmed = await confirmAsync({ title: '确认删除？', content: '此操作不可撤销' });
   * if (confirmed) { await deleteItem(); }
   */
  const confirmAsync = useCallback(
    (config: Omit<AppModalConfig, 'onOk' | 'onCancel'>): Promise<boolean> => {
      return new Promise((resolve) => {
        modal.confirm({
          ...config,
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
    },
    [modal]
  );

  /**
   * openFormModal - 专门用于承载表单或复杂自定义内容的弹窗
   * 特点：
   * 1. 自动设置 maskClosable: false，防止误触关闭导致表单数据丢失。
   * 2. 自动注入 onSubmit 回调到确定按钮，支持异步提交（显示 loading）。
   * 3. 宽度默认 600px，更适合表单场景。
   *
   * 示例：
   * openFormModal({
   *   title: '编辑用户',
   *   content: <MyForm form={form} />,
   *   onSubmit: async () => {
   *     const values = await form.validateFields();
   *     await api.updateUser(values);
   *   }
   * });
   */
  const openFormModal = useCallback(
    (config: AppModalConfig & { onSubmit?: () => void | Promise<void> }) => {
      const { onSubmit, ...rest } = config;

      return modal.confirm({
        width: 600,
        icon: null,
        maskClosable: false,
        ...rest,
        onOk: onSubmit
          ? async (close) => {
              try {
                await onSubmit();
                close();
              } catch {
                // 提交失败时不关闭弹窗，由调用方处理错误提示
              }
            }
          : rest.onOk,
      });
    },
    [modal]
  );

  return {
    info,
    success,
    error,
    warning,
    confirm,
    confirmAsync,
    openFormModal,
  };
};

export default useAppModal;
