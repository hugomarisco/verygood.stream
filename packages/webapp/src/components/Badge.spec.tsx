import { shallow } from "enzyme";
import React from "react";
import { Badge } from "./Badge";

test("Badge has the correct text", () => {
  const badge = shallow(<Badge>1080p</Badge>);

  expect(badge.children().text()).toEqual("1080p");
});
