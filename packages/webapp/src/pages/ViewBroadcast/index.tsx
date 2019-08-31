import {
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod,
  SwarmMetadata,
  LiveSignatureAlgorithm
} from "@bitstreamy/commons";
import { inject, observer } from "mobx-react";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router";
import { Badge } from "../../components/Badge";
import { Column } from "../../components/Column";
import { Container } from "../../components/Container";
import {
  EyeIcon,
  SoccerBallIcon,
  UploadDownloadIcon
} from "../../components/Icon";
import { Input } from "../../components/Input";
import { P } from "../../components/P";
import { Row } from "../../components/Row";
import { TopNav } from "../../components/TopNav";
import { EditBroadcastStore } from "../../stores/EditBroadcastStore";
import {
  BroadcastInformationSection,
  CategoryIconContainer,
  StreamDetails,
  StreamTitle,
  VideoPlayer
} from "./styles";

interface IViewBroadcastRouteParams {
  broadcastId: string;
}

interface IViewBroadcastProps
  extends RouteComponentProps<IViewBroadcastRouteParams> {
  editBroadcastStore: EditBroadcastStore;
}

@inject("editBroadcastStore")
@observer
export class ViewBroadcast extends Component<IViewBroadcastProps> {
  public componentDidMount() {
    const { editBroadcastStore, match } = this.props;

    editBroadcastStore.fetchById(match.params.broadcastId);
  }

  public render() {
    const { editBroadcastStore } = this.props;

    const { broadcast } = editBroadcastStore;

    if (!broadcast) {
      return null;
    }

    const {
      title,
      category,
      swarmId,
      chunkSize,
      chunkAddressingMethod,
      contentIntegrityProtectionMethod,
      liveSignatureAlgorithm
    } = broadcast;

    return (
      <div>
        {swarmId && (
          <VideoPlayer
            key={swarmId}
            liveDiscardWindow={200}
            swarmMetadata={
              new SwarmMetadata(
                Buffer.from(swarmId, "base64"),
                chunkSize,
                chunkAddressingMethod,
                contentIntegrityProtectionMethod,
                liveSignatureAlgorithm
              )
            }
          />
        )}

        <BroadcastInformationSection>
          <Container>
            <Row>
              <Column />
              <Column span={[2]}>
                <CategoryIconContainer>
                  <SoccerBallIcon width="30px" height="30px" />
                </CategoryIconContainer>
              </Column>
              <Column span={[8]}>
                <StreamTitle>
                  <P dark>{title}</P>
                  <P dark translucent>
                    {category && category.name}
                  </P>
                </StreamTitle>
              </Column>
            </Row>

            <Row>
              <Column />
              <Column span={[10]}>
                <StreamDetails>
                  <EyeIcon color="dark" translucent />
                  <P dark>2.9K</P>
                  <UploadDownloadIcon color="dark" translucent />
                  <P dark>3.1Mb/s</P>
                  <Badge dark>
                    <P dark>1080p</P>
                  </Badge>
                </StreamDetails>
              </Column>
            </Row>

            <Row>
              <Column />
              <Column span={[10]}>
                <Input />
              </Column>
            </Row>
          </Container>
        </BroadcastInformationSection>
      </div>
    );
  }
}
