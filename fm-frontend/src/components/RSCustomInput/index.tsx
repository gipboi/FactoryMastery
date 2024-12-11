import { FormGroup, Input, Label } from "reactstrap";

export interface RSCustomInputProps extends React.HTMLAttributes<HTMLInputElement> {
  // Add props here
}

const RSCustomInput = (props: RSCustomInputProps) => {
  return (
    <FormGroup check inline>
      <Input type="checkbox" />
      <Label check>Some other input</Label>
    </FormGroup>
  );
};

export default RSCustomInput;
