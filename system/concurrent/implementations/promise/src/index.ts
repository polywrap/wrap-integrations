import { CoreClient, InvokeResult } from "@polywrap/core-js";
import { PluginFactory, PluginPackage } from "@polywrap/plugin-js";
import { msgpackEncode } from "@polywrap/msgpack-js"
import {
  Args_result,
  Args_schedule,
  Args_status,
  Int,
  Interface_ReturnWhenEnum,
  Interface_Task,
  Interface_TaskResult,
  Interface_TaskStatus,
  Interface_TaskStatusEnum,
  manifest,
  Module,
} from "./wrap";

export interface ConcurrentPromisePluginConfig extends Record<string, unknown> {
  cache?: Map<string, string>;
}

export class ConcurrentPromisePlugin extends Module<ConcurrentPromisePluginConfig> {
  private _totalTasks = 0;
  private _tasks: Record<number, Promise<InvokeResult>> = {};
  private _status: Record<number, Interface_TaskStatus> = {};

  constructor(config: ConcurrentPromisePluginConfig) {
    super(config);
  }

  public async result(
    input: Args_result,
    client: CoreClient
  ): Promise<Array<Interface_TaskResult>> {
    switch (input.returnWhen) {
      case Interface_ReturnWhenEnum.FIRST_COMPLETED: {
        const result = await Promise.race(
          input.taskIds.map((id) => this.resolveTask(id))
        );
        return [result];
      }
      case Interface_ReturnWhenEnum.ALL_COMPLETED: {
        return await Promise.all(
          input.taskIds.map((id) => this.resolveTask(id))
        );
      }
      case Interface_ReturnWhenEnum.ANY_COMPLETED: {
        const result = await Promise.any(
          input.taskIds.map((id) => this.resolveTask(id)
            .then((result) => {
              if (result.error) {
                return Promise.reject(result.error);
              }
              return result;
            })
          )
        ).catch((err: AggregateError) => input.taskIds.map((id, idx) => ({
            taskId: id,
            result: undefined,
            error: err.errors[idx],
            status: Interface_TaskStatusEnum.FAILED,
          }))
        );
        return Array.isArray(result) ? result : [result];
      }
      default:
        throw new Error("Invalid value of ReturnWhen enum: " + input.returnWhen);
    }
  }

  public async status(
    input: Args_status,
    client: CoreClient
  ): Promise<Array<Interface_TaskStatus>> {
    return input.taskIds.map((id) => this._status[id]);
  }

  public schedule(input: Args_schedule, client: CoreClient): Array<Int> {
    return input.tasks.map((task) => {
      return this.scheduleTask(
        {
          ...task,
        },
        client
      );
    });
  }

  private scheduleTask(task: Interface_Task, client: CoreClient): number {
    this._tasks[this._totalTasks] = client.invoke(task);
    this._status[this._totalTasks] = Interface_TaskStatusEnum.RUNNING;
    return this._totalTasks++;
  }

  private resolveTask(taskId: number): Promise<Interface_TaskResult> {
    return this._tasks[taskId]
      .then((result: InvokeResult) => {
        this._status[taskId] = Interface_TaskStatusEnum.COMPLETED;
        if (!result.ok) {
          return {
            taskId,
            result: undefined,
            error: result.error?.message ?? `Unknown error occurred in concurrent task ${taskId}`,
            status: Interface_TaskStatusEnum.FAILED,
          };
        }
        return {
          taskId: taskId,
          result: new Uint8Array(msgpackEncode(result.value)),
          error: undefined,
          status: Interface_TaskStatusEnum.COMPLETED,
        };
      })
      .catch((err) => {
        this._status[taskId] = Interface_TaskStatusEnum.FAILED;
        return {
          taskId: taskId,
          result: undefined,
          error: err.message ?? `Unknown error occurred in concurrent task ${taskId}`,
          status: Interface_TaskStatusEnum.FAILED,
        };
      });
  }
}

export const concurrentPromisePlugin: PluginFactory<
  ConcurrentPromisePluginConfig
> = (config: ConcurrentPromisePluginConfig) =>
  new PluginPackage<ConcurrentPromisePluginConfig>(new ConcurrentPromisePlugin(config), manifest);

export const plugin = concurrentPromisePlugin;
