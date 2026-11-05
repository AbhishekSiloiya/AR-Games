import assert from 'node:assert/strict';
import {renderQuality,nextQualityGrade} from './render-quality.ts';
const quality=renderQuality('quality',0,1024,576,2);assert.equal(quality.ratio,1.25);assert.equal(quality.shadows,true);assert.equal(quality.bloom,true);
const tablet=renderQuality('performance',0,1366,1024,2);assert.equal(tablet.shadows,false);assert.equal(tablet.bloom,false);assert.ok(tablet.ratio<1);assert.ok(1366*1024*tablet.ratio**2<=921601);
const auto=renderQuality('auto',1,1024,576,2);assert.equal(auto.shadows,false);assert.equal(auto.lean,true);assert.ok(renderQuality('auto',2,1024,576,2).ratio<auto.ratio);assert.equal(renderQuality('quality',2,1024,576,2).shadows,true);
assert.equal(nextQualityGrade('auto',0,2.01),1);assert.equal(nextQualityGrade('auto',1,4.01),2);assert.equal(nextQualityGrade('auto',2,100),2);assert.equal(nextQualityGrade('quality',0,100),0);assert.equal(nextQualityGrade('performance',0,2.01),0);assert.equal(nextQualityGrade('performance',0,4.01),2);
console.log('PASS shared quality/shadow policy, pixel budget and bounded automatic downgrade');
