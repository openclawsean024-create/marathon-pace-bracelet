import { describe, it, expect } from 'vitest';
import { COURSES } from './courses';

describe('COURSES', () => {
  it('should contain 4 courses', () => {
    const ids = Object.keys(COURSES);
    expect(ids).toHaveLength(4);
  });

  it('should have courses with correct IDs', () => {
    expect(COURSES).toHaveProperty('taipei');
    expect(COURSES).toHaveProperty('taichung');
    expect(COURSES).toHaveProperty('yilan');
    expect(COURSES).toHaveProperty('penghu');
  });

  it('should have required fields for each course', () => {
    for (const course of Object.values(COURSES)) {
      expect(course).toHaveProperty('id');
      expect(course).toHaveProperty('name');
      expect(course).toHaveProperty('nameEn');
      expect(course).toHaveProperty('totalKm');
      expect(course).toHaveProperty('totalDPlus');
      expect(course).toHaveProperty('totalDMinus');
      expect(course).toHaveProperty('elevationNodes');
    }
  });

  it('should have elevationNodes as non-empty arrays', () => {
    for (const course of Object.values(COURSES)) {
      expect(Array.isArray(course.elevationNodes)).toBe(true);
      expect(course.elevationNodes.length).toBeGreaterThan(0);
    }
  });

  it('should have correct D+ and D- values', () => {
    expect(COURSES.taipei.totalDPlus).toBe(104);
    expect(COURSES.taipei.totalDMinus).toBe(106);
    expect(COURSES.taichung.totalDPlus).toBe(80);
    expect(COURSES.taichung.totalDMinus).toBe(80);
    expect(COURSES.yilan.totalDPlus).toBe(50);
    expect(COURSES.yilan.totalDMinus).toBe(50);
    expect(COURSES.penghu.totalDPlus).toBe(280);
    expect(COURSES.penghu.totalDMinus).toBe(280);
  });

  it('should have correct number of elevation nodes', () => {
    expect(COURSES.taipei.elevationNodes).toHaveLength(10);
    expect(COURSES.taichung.elevationNodes).toHaveLength(7);
    expect(COURSES.yilan.elevationNodes).toHaveLength(7);
    expect(COURSES.penghu.elevationNodes).toHaveLength(9);
  });

  it('should have CourseNode with km and elevation', () => {
    for (const course of Object.values(COURSES)) {
      for (const node of course.elevationNodes) {
        expect(typeof node.km).toBe('number');
        expect(typeof node.elevation).toBe('number');
      }
    }
  });

  it('should have km values that are non-negative', () => {
    for (const course of Object.values(COURSES)) {
      for (const node of course.elevationNodes) {
        expect(node.km).toBeGreaterThanOrEqual(0);
        expect(node.elevation).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('should have specialNotes for each course', () => {
    for (const course of Object.values(COURSES)) {
      expect(Array.isArray(course.specialNotes)).toBe(true);
      expect(course.specialNotes!.length).toBeGreaterThan(0);
    }
  });
});
