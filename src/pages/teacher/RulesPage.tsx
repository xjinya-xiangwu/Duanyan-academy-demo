import { Link } from "react-router-dom";
import { paths } from "../../domain/model";

export function RulesPage() {
  return (
    <article>
      <p className="kicker">次要说明</p>
      <h1>回流说明</h1>
      <p>
        真实科研轨迹数据回流数 <span className="tag">演示／Mock</span>
      </p>
      <p>数字在班级进度和回流数据集里。这里只说明什么计入、什么不计入。这不是完成率表。</p>
      <p>计入：合法回传；优化成功；老师对某次提交做完一次辅助评估。</p>
      <p>不计：教学已读、课页勾选、空点优化或评估、无效邀请码、只打开端砚、配置和评论。</p>
      <p>去重：同一课题、同一单元、同一类型，重复回传不叠加。第二次成功优化可以再计一次，第三次起不加。同一单元的评估只计一次。</p>
      <p>类型：① 实训执行／产物回传。② 提交前 Agent 优化。③ 老师 AI 辅助评估。④ 同一课题后续作业步骤再回传。</p>
      <p className="fine">
        <Link to={paths.teacherDataset}>去回流数据集核对</Link>
      </p>
    </article>
  );
}
