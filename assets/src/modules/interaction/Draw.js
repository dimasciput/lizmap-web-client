import { mainLizmap, mainEventDispatcher } from '../Globals.js';

import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Draw as olDraw, Modify as olModify } from 'ol/interaction';

export default class Draw {

    constructor(){}

    /**
     * Initialize Draw based on new OL
     * @param {string} [geomType="Point"] The geometry type. One of 'Point', 'LineString', 'LinearRing', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection', 'Circle'.
     * @param {number} [maxFeatures=-1] Limit the draw to maxFeatures features
     * @param {boolean} [modify=true] Allow to modify features after being drawn
     * @memberof Draw
     */
    init(geomType = "Point", maxFeatures = -1, modify = true) {
        if (this._drawSource){
            this.clear();
        }

        mainLizmap.newOlMap = true;

        this._drawSource = new VectorSource();

        // Dispatch event when a feature is added
        this._drawSource.on('addfeature', () => {
            mainEventDispatcher.dispatch('draw.addFeature');
        });

        this._drawLayer = new VectorLayer({
            source: this._drawSource,
            style: new Style({
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 0.2)',
                }),
                stroke: new Stroke({
                    color: '#ffcc33',
                    width: 2,
                }),
                image: new CircleStyle({
                    radius: 7,
                    fill: new Fill({
                        color: '#ffcc33',
                    }),
                }),
            }),
        });

        mainLizmap.map._olMap.addLayer(this._drawLayer);

        this._drawInteraction = new olDraw({
            source: this._drawSource,
            type: geomType,
        });

        this._drawInteraction.on('drawend', () => {
            // Limit the draw to maxFeatures features
            if (maxFeatures !== -1 && this._drawSource.getFeatures().length === maxFeatures - 1) {
                mainLizmap.map._olMap.removeInteraction(this._drawInteraction);
            }
        });

        mainLizmap.map._olMap.addInteraction(this._drawInteraction);

        if (modify) {
            this._modifyInteraction = new olModify({ source: this._drawSource });
            mainLizmap.map._olMap.addInteraction(this._modifyInteraction);
        }
    }

    clear(){
        this._drawSource.clear(true);
    }

    set visible(visible) {
        this._drawLayer.setVisible(visible);
        mainLizmap.newOlMap = visible;
    }

    get features(){
        return this._drawSource.getFeatures();
    }
}
