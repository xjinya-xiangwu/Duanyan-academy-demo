import type { ConfigKey } from "../domain/content";
import { useCourse } from "../store";

export function ConfiguredCopy({
  configKey,
  requirementLead = "",
}: {
  configKey: ConfigKey;
  requirementLead?: string;
}) {
  const { state } = useCourse();
  const config = state.configs[configKey];
  return (
    <div className="configured" data-testid="unit-config-copy">
      <p data-testid="configured-notes">{config.notes}</p>
      <p data-testid="configured-requirement">
        {requirementLead}
        {config.requirement}
      </p>
      <p data-testid="configured-duanyan">
        {config.duanyanRequired ? "须在端砚中完成。" : "不要求在端砚中完成。"}
      </p>
    </div>
  );
}
