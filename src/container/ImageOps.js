import React from 'react';

import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { api } from '../utils/Api';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';


export default class ImageOps extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      image_object: null,
      image_object_details: {},
      active_type: null
    }
  }

  updateImageObject(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      this.setState({ image_object: reader.result, image_object_details: {}, active_type: null });
    };

  }

  processImageObject(type) {
    const { image_object_details, active_type, image_object } = this.state;

    this.setState({ active_type: type }, () => {

      if (!image_object_details[active_type]) {
        api("detect_image_objects", {
          type,
          data: image_object
        }).then((response) => {

          const filtered_data = response;
          const image_details = image_object_details;

          image_details[filtered_data.type] = filtered_data.data;

          this.setState({ image_object_details: image_details });
        });
      }
    });
  }

  render() {
    const { image_object, active_type, image_object_details } = this.state
    return (
      <Container maxWidth="md">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CardContent>
              <Typography variant="h4" color="textPrimary" component="h4">
                Object Detection Tensorflow
                            </Typography>
            </CardContent>
          </Grid>
          <Grid item xs={12}>
            {image_object &&
              <img src={image_object} alt="" height="500px" />
            }
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Button variant="contained"
                  component='label' // <-- Just add me!
                >
                  Upload Image
                                    <input accept="image/jpeg" onChange={(e) => this.updateImageObject(e)} type="file" style={{ display: 'none' }} />
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Grid container justify="center" spacing={3}>
              <Grid item >
                {image_object && <Button onClick={() => this.processImageObject("imagenet")} variant="contained" color="primary">
                  Get objects with ImageNet
                                </Button>}
              </Grid>
              <Grid item>
                {image_object && <Button onClick={() => this.processImageObject("coco-ssd")} variant="contained" color="secondary">
                  Get objects with Coco SSD
                                </Button>}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={9}>
            <Grid container justify="center">
              {active_type && image_object_details[active_type] &&
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="textPrimary" component="h4">
                        {active_type.toUpperCase()}
                      </Typography>
                      <ImageDetails type={active_type} data={image_object_details[active_type]}></ImageDetails>
                    </CardContent>
                  </Card>
                </Grid>
              }
              {active_type && !image_object_details[active_type] &&
                <Grid item xs={12}>
                  <CircularProgress
                    color="secondary"
                  />
                </Grid>
              }
            </Grid>
          </Grid>
        </Grid>
      </Container>
    )
  }
}

class ImageDetails extends React.Component {

  render() {
    const { type, data } = this.props;

    return (
      <Grid item xs={12}>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Objects</TableCell>
                <TableCell align="right">Probability</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(row => {
                if (type === "imagenet") {
                  return (
                    <TableRow key={row.className}>
                      <TableCell component="th" scope="row">
                        {row.className}
                      </TableCell>
                      <TableCell align="right">{row.probability.toFixed(2)}</TableCell>
                    </TableRow>
                  )
                } else if (type === "coco-ssd") {
                  return (
                    <TableRow key={row.className}>
                      <TableCell component="th" scope="row">
                        {row.class}
                      </TableCell>
                      <TableCell align="right">{row.score.toFixed(2)}</TableCell>
                    </TableRow>
                  )
                }
                // return empty;
              })
              }
            </TableBody>
          </Table>
        </Paper>

      </Grid>
    )
  }
}