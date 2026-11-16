import { Link } from "react-router-dom";
import { Icon } from "./icons";

export function CourseJourney() {
  return <section className="course-journey"><div className="section-heading"><h2>从课程学习，走向真实研究</h2><span>AI4S 高校共建课程</span></div><ol>
    <li><span>01 · 大师课</span><h3>看见 AI 加速科研的方法</h3><p>公开课引导科研兴趣，不设证书。当前仅展示课程层级。</p></li>
    <li><span>02 · 学分课</span><h3>在课程里完成模拟训练</h3><p>完整规划为 16 周、2—3 学分。本课是生医专业课片段样例，交付作品集与过程资产，学分由高校认定。</p></li>
    <li><span>03 · 真实课题实战</span><h3>自带课题，或与导师双选</h3><p>修完学分课后进入实战。可复现成果验收后才具备实战认证条件。</p><Link className="text-link" to="/course/research">浏览两条实战路径<Icon name="arrow" size={15} /></Link></li>
  </ol><details><summary>通识课与专业课如何配合</summary><p>通识课：问题定义 → 文献证据链 → 最小数据分析 → 纠错 → SKILL，偏标准化与自动校验。专业课：真实学科问题、专家 rubric、教师纠错与长期任务。本 Demo 保留生医片段，未编制完整两套课程。</p></details></section>;
}
