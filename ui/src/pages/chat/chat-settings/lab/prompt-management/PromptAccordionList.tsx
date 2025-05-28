import React from "react";
import PromptAccordionItem from "./PromptAccordionItem";

const PromptAccordionList = ({
  fields,
  expanded,
  onAccordionChange,
  control,
  errors,
  outputJsonErrors,
  promptValues,
  tokenSizes,
  handleSelectPrompt,
  handleDeletePrompt,
  openTestDrawer,
}: {
  fields: any[];
  expanded: number | false;
  onAccordionChange: (panel: number) => (_event: React.SyntheticEvent, isExpanded: boolean) => void;
  control: any;
  errors: any;
  outputJsonErrors: any;
  promptValues: any;
  tokenSizes: any;
  handleSelectPrompt: (idx: number) => void;
  handleDeletePrompt: (idx: number) => void;
  openTestDrawer: (idx: number) => void;
}) => (
  <div>
    {fields.map((item, idx) => (
      <PromptAccordionItem
        key={item.id}
        idx={idx}
        item={item}
        expanded={expanded}
        onAccordionChange={onAccordionChange}
        control={control}
        errors={errors}
        outputJsonErrors={outputJsonErrors}
        promptValues={promptValues}
        tokenSizes={tokenSizes}
        handleSelectPrompt={handleSelectPrompt}
        handleDeletePrompt={handleDeletePrompt}
        openTestDrawer={openTestDrawer}
        fields={fields}
      />
    ))}
  </div>
);

export default PromptAccordionList;
