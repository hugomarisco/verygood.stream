import React from "react";
import styled from "styled-components";
import Header from '../../components/Header';
import SubHeader from '../../components/SubHeader';

const Panel = styled.section``;

const StreamDetails = () => (
  <Panel>
    <Header>Real Madrid vs Barcelona</Header>
    <SubHeader>00:11:22:33:44:55:66:77:88:99:aa:bb:cc:dd:ee:ff</SubHeader>
  </Panel>
);

StreamDetails.Panel = Panel;

export default StreamDetails;
